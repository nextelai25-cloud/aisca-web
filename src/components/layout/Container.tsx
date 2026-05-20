import { forwardRef } from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Standard container — 1200px max-width, 24px side padding always present
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: '100%',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = 'Container';

// Wide container — 1400px for hero/gallery sections
export function ContainerWide({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export default Container;
