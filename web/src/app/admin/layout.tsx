export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 w-56 h-full bg-white border-r border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800">管理后台</h2>
        <nav className="mt-4 space-y-1">
          <a href="/admin" className="block py-2 text-slate-600 hover:text-slate-900">概览</a>
          <a href="/admin/jobs" className="block py-2 text-slate-600 hover:text-slate-900">校招岗位</a>
          <a href="/admin/civil" className="block py-2 text-slate-600 hover:text-slate-900">事业编岗位</a>
          <a href="/admin/feishu" className="block py-2 text-slate-600 hover:text-slate-900">飞书同步</a>
          <a href="/admin/skus" className="block py-2 text-slate-600 hover:text-slate-900">会员商品与定价</a>
          <a href="/admin/docs" className="block py-2 text-slate-600 hover:text-slate-900">面试资料</a>
          <a href="/admin/orders" className="block py-2 text-slate-600 hover:text-slate-900">订单</a>
          <a href="/admin/members" className="block py-2 text-slate-600 hover:text-slate-900">会员管理</a>
          <a href="/admin/users" className="block py-2 text-slate-600 hover:text-slate-900">用户列表</a>
          <a href="/admin/feedback" className="block py-2 text-slate-600 hover:text-slate-900">反馈处理</a>
          <a href="/admin/dicts" className="block py-2 text-slate-600 hover:text-slate-900">字典维护</a>
          <a href="/admin/login" className="block py-2 text-slate-600 hover:text-slate-900">登录</a>
        </nav>
      </aside>
      <main className="ml-56 p-6">{children}</main>
    </div>
  );
}
