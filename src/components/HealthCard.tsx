import type { ReactNode } from 'react';

type HealthCardProps = {
  children: ReactNode;
  className?: string;
};

export const HealthCard = ({ children, className = '' }: HealthCardProps) => {
  return <section className={`health-card ${className}`}>{children}</section>;
};