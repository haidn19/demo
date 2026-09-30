package com.example.demo.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Restores the complete data set from {@code seed-data.sql} when the application
 * is started with {@code --seed=true}.
 *
 * <p>The source is a MySQL command-line dump, so only its data INSERT statements
 * are sent through JDBC. Session commands, table locks, and dump metadata are not
 * valid or needed in this application.</p>
 */
@Configuration
@ConditionalOnProperty(name = "seed", havingValue = "true")
public class Seed {

    private static final Pattern INSERT_STATEMENT = Pattern.compile(
            "(?is)INSERT\\s+INTO\\s+`([^`]+)`\\s+VALUES\\s+.*?;");

    private static final List<String> TABLES_TO_CLEAR = List.of(
            "attendance_punch", "payroll", "leaves", "attendance", "employees", "department", "users");

    private static final Set<String> EXPECTED_TABLES = Set.of(
            "attendance", "attendance_punch", "department", "employees", "leaves", "payroll", "users");

    /*
     * The dump was exported without column names. Declare its original column
     * order explicitly so it stays compatible when Hibernate changes the
     * physical order in which columns were added to a table.
     */
    private static final Map<String, String> INSERT_COLUMNS = Map.of(
            "attendance", "`id`, `check_in`, `check_out`, `work_date`, `employee_id`, "
                    + "`afternoon_minutes`, `balance_minutes`, `early_leave_minutes`, `early_minutes`, "
                    + "`extra_minutes`, `late_minutes`, `morning_work_lost`, `status`, "
                    + "`afternoon_work_lost`, `late_penalty_minutes`, `morning_minutes`, "
                    + "`overtime_minutes`, `effective_out`, `late_multiplier`, `working_minutes`, "
                    + "`overtime_multiplier`",
            "attendance_punch", "`id`, `employee_id`, `punched_at`",
            "department", "`id`, `name`, `leader_id`",
            "employees", "`id`, `employee_name`, `address`, `date_of_birth`, `department`, `email`, "
                    + "`phone_number`, `tax_code`, `department_id`, `base_salary`, `leave_days`",
            "leaves", "`id`, `employee_id`, `employee_name`, `end_date`, `leave_days`, `reason`, "
                    + "`start_date`, `status`, `unpaid_leave_days`",
            "payroll", "`id`, `base_salary`, `gross_salary`, `payroll_month`, `net_salary`, "
                    + "`employee_id`, `overtime_minutes`, `leave_days_used`, `deduction_required`, "
                    + "`monthly_balance_minutes`",
            "users", "`id`, `username`, `password`, `role`, `status`");

    @Bean
    CommandLineRunner restoreSeedData(DataSource dataSource) {
        return args -> restore(dataSource, readDump());
    }

    private void restore(DataSource dataSource, String dump) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            boolean originalAutoCommit = connection.getAutoCommit();
            try {
                connection.setAutoCommit(false);
                try (Statement statement = connection.createStatement()) {
                    statement.execute("SET NAMES utf8mb4");
                    statement.execute("SET FOREIGN_KEY_CHECKS = 0");

                    clearTables(statement);
                    restoreInsertStatements(statement, dump);
                    connection.commit();
                }
            } catch (SQLException | RuntimeException exception) {
                rollback(connection, exception);
                throw exception;
            } finally {
                enableForeignKeyChecks(connection);
                connection.setAutoCommit(originalAutoCommit);
            }
        }
    }

    private void clearTables(Statement statement) throws SQLException {
        for (String table : TABLES_TO_CLEAR) {
            statement.executeUpdate("DELETE FROM `" + table + "`");
        }
    }

    private void restoreInsertStatements(Statement statement, String dump) throws SQLException {
        Matcher matcher = INSERT_STATEMENT.matcher(dump);
        Set<String> restoredTables = new LinkedHashSet<>();

        while (matcher.find()) {
            String table = matcher.group(1);
            if (!EXPECTED_TABLES.contains(table)) {
                throw new IllegalStateException("Unexpected table in seed-data.sql: " + table);
            }
            if (!restoredTables.add(table)) {
                throw new IllegalStateException("Duplicate INSERT block in seed-data.sql for table: " + table);
            }
            statement.executeUpdate(withColumnNames(table, matcher.group()));
        }

        if (!restoredTables.equals(EXPECTED_TABLES)) {
            Set<String> missingTables = new LinkedHashSet<>(EXPECTED_TABLES);
            missingTables.removeAll(restoredTables);
            throw new IllegalStateException("seed-data.sql is incomplete; missing data for: " + missingTables);
        }
    }

    private String withColumnNames(String table, String insertStatement) {
        String prefix = "INSERT INTO `" + table + "` VALUES";
        return insertStatement.replace(prefix, "INSERT INTO `" + table + "` ("
                + INSERT_COLUMNS.get(table) + ") VALUES");
    }

    private void rollback(Connection connection, Exception originalException) {
        try {
            connection.rollback();
        } catch (SQLException rollbackException) {
            originalException.addSuppressed(rollbackException);
        }
    }

    private void enableForeignKeyChecks(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute("SET FOREIGN_KEY_CHECKS = 1");
        }
    }

    private String readDump() throws IOException {
        for (Path path : List.of(Path.of("seed-data.sql"), Path.of("demo", "seed-data.sql"))) {
            if (Files.isRegularFile(path)) {
                return Files.readString(path, StandardCharsets.UTF_8);
            }
        }

        throw new IllegalStateException(
                "Cannot find seed-data.sql. Run the application from demo or the repository root.");
    }
}
