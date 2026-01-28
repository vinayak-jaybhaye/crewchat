function SettingRow({
  title,
  description,
  action,
  danger,
  children,
}: {
  title: string;
  description?: string;
  action?: string;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border border-neutral-800 rounded-lg p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-neutral-400">{description}</p>
        )}
      </div>

      {children ? (
        children
      ) : (
        <button
          className={`text-sm ${
            danger
              ? "text-red-400 hover:underline"
              : "text-blue-400 hover:underline"
          }`}
        >
          {action}
        </button>
      )}
    </div>
  );
}
