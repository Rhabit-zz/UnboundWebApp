export function Sidebar({ className = "", children }) {
  return (
    <aside className={`w-72 shrink-0 ${className}`}>
      {children}
    </aside>
  );
}

export function SidebarProvider({ children }) {
  return <div className="flex">{children}</div>;
}
export function SidebarHeader({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
export function SidebarFooter({ className = "", children }) {
  return <div className={className}>{children}</div>;
}
export function SidebarContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroup({ children }) { return <div>{children}</div>; }
export function SidebarGroupContent({ children }) { return <div>{children}</div>; }

export function SidebarMenu({ children }) { return <nav>{children}</nav>; }
export function SidebarMenuItem({ children }) { return <div>{children}</div>; }
export function SidebarMenuButton({ asChild = false, className = "", children, ...props }) {
  const Comp = asChild ? "span" : "button";
  return <Comp className={`w-full text-left ${className}`} {...props}>{children}</Comp>;
}

/* Simple mobile trigger placeholder */
export function SidebarTrigger({ className = "", ...props }) {
  return <button className={`rounded-lg ${className}`} {...props}>☰</button>;
}