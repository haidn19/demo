interface Props {
  type?: "loading" | "error" | "empty";
  title: string;
  description?: string;
}

export default function PageState({
  type = "empty",
  title,
  description,
}: Props) {
  return (
    <div className={`pageState ${type}`} role={type === "error" ? "alert" : undefined}>
      <span aria-hidden="true">
        {type === "loading" ? "···" : type === "error" ? "!" : "—"}
      </span>
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
