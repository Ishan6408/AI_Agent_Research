
interface KPICardProps {
  title: string;
  value: string | number;
}

export function KPICard({ title, value }: KPICardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-center h-full">
      <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}
