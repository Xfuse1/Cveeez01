import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data",
  description = "There's nothing to show here yet.",
  icon,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
    {icon && <div className="mb-4">{icon}</div>}
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="mb-4 text-sm">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
