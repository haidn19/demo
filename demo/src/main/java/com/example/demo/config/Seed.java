package com.example.demo.config;

import com.example.demo.entity.Attendance;
import com.example.demo.entity.AttendancePunch;
import com.example.demo.entity.Employee;
import com.example.demo.repository.AttendancePunchRepository;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.service.AttendanceService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "seed", havingValue = "true")
public class Seed {

    private final AttendancePunchRepository punchRepository;

    public Seed(AttendancePunchRepository punchRepository) {
        this.punchRepository = punchRepository;
    }

    private static final LocalTime STANDARD_CHECK_IN = LocalTime.of(8, 30);
    private static final LocalTime STANDARD_CHECK_OUT = LocalTime.of(17, 30);

    @Bean
    CommandLineRunner seedAttendance(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository
    ) {
        return args -> {
            // Dữ liệu mẫu luôn được tạo lại từ đầu để raw punch khớp với bảng attendance.
            punchRepository.deleteAllInBatch();
            attendanceRepository.deleteAllInBatch();

            Employee employeeA = employee(employeeRepository, "Nguyễn Văn A");
            Employee employeeB = employee(employeeRepository, "Nguyễn Văn B");
            Employee employeeC = employee(employeeRepository, "Nguyễn Văn C");
            Employee employeeD = employee(employeeRepository, "Nguyễn Văn D");

            LocalDate today = LocalDate.now();
            seedDefaultWorkdays(attendanceRepository, employeeA.getId(), today, Set.of(today.getDayOfMonth()));
            seedDefaultWorkdays(attendanceRepository, employeeB.getId(), today, Set.of(3, 8, 11, 14));
            seedDefaultWorkdays(attendanceRepository, employeeC.getId(), today, Set.of(4, 7, 8));
            seedDefaultWorkdays(attendanceRepository, employeeD.getId(), today, Set.of(3, 4, 7, 9, 12));

            seedEmployeeA(attendanceRepository, employeeA.getId(), today);

            saveStandard(attendanceRepository, employeeB.getId(), today.withDayOfMonth(3), LocalTime.of(9, 20));
            saveStandard(attendanceRepository, employeeB.getId(), today.withDayOfMonth(8), LocalTime.of(9, 0));
            saveStandard(attendanceRepository, employeeB.getId(), today.withDayOfMonth(11), LocalTime.of(9, 40));
            saveStandard(attendanceRepository, employeeB.getId(), today.withDayOfMonth(14), LocalTime.of(8, 0));

            saveStandard(attendanceRepository, employeeC.getId(), today.withDayOfMonth(4), LocalTime.of(9, 32));
            saveStandard(attendanceRepository, employeeC.getId(), today.withDayOfMonth(7), LocalTime.of(9, 0));
            saveOvertime(attendanceRepository, employeeC.getId(), today.withDayOfMonth(8),
                    LocalTime.of(9, 40), LocalTime.of(23, 0));

            saveStandard(attendanceRepository, employeeD.getId(), today.withDayOfMonth(3), LocalTime.of(8, 0));
            saveStandard(attendanceRepository, employeeD.getId(), today.withDayOfMonth(4), LocalTime.of(8, 15));
            saveStandard(attendanceRepository, employeeD.getId(), today.withDayOfMonth(7), LocalTime.of(8, 45));
            saveStandard(attendanceRepository, employeeD.getId(), today.withDayOfMonth(9), LocalTime.of(9, 29));
            saveOvertime(attendanceRepository, employeeD.getId(), today.withDayOfMonth(12),
                    LocalTime.of(8, 30), LocalTime.of(17, 30));
        };
    }

    private Employee employee(EmployeeRepository repository, String name) {
        return repository.findAll().stream()
                .filter(item -> name.equals(item.getEmployeeName()))
                .findFirst()
                .orElseGet(() -> repository.save(new Employee(name)));
    }

    private void seedEmployeeA(AttendanceRepository repository, Long employeeId, LocalDate today) {
        saveWorking(repository, employeeId, today, STANDARD_CHECK_IN);
    }

    private void seedDefaultWorkdays(
            AttendanceRepository repository,
            Long employeeId,
            LocalDate today,
            Set<Integer> exceptionDays
    ) {
        LocalDate date = today.withDayOfMonth(1);
        while (!date.isAfter(today)) {
            if (date.getDayOfWeek().getValue() <= 5 && !exceptionDays.contains(date.getDayOfMonth())) {
                saveStandard(repository, employeeId, date, STANDARD_CHECK_IN);
            }
            date = date.plusDays(1);
        }
    }

    private void saveStandard(
            AttendanceRepository repository,
            Long employeeId,
            LocalDate date,
            LocalTime checkIn
    ) {
        saveAttendance(repository, employeeId, date, checkIn, STANDARD_CHECK_OUT);
    }

    private void saveWorking(
            AttendanceRepository repository,
            Long employeeId,
            LocalDate date,
            LocalTime checkIn
    ) {
        saveAttendance(repository, employeeId, date, checkIn, null);
    }

    private void saveOvertime(
            AttendanceRepository repository,
            Long employeeId,
            LocalDate date,
            LocalTime checkIn,
            LocalTime checkOut
    ) {
        saveAttendance(repository, employeeId, date, checkIn, checkOut);
    }

    private void saveAttendance(
            AttendanceRepository repository,
            Long employeeId,
            LocalDate date,
            LocalTime checkIn,
            LocalTime checkOut
    ) {
        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setWorkDate(date);
        attendance.setCheckIn(LocalDateTime.of(date, checkIn));
        attendance.setCheckOut(checkOut == null ? null : LocalDateTime.of(date, checkOut));
        punchRepository.save(new AttendancePunch(employeeId, attendance.getCheckIn()));
        if (attendance.getCheckOut() != null) {
            punchRepository.save(new AttendancePunch(employeeId, attendance.getCheckOut()));
        }
        AttendanceService.calculate(attendance, Set.of(), false);
        repository.save(attendance);
    }
}
