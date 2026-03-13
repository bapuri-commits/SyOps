import Navbar from "../components/Navbar";

export default function Blog() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="text-4xl">✍️</span>
        <h1 className="mt-4 text-2xl font-bold text-white">블로그</h1>
        <p className="mt-2 text-slate-400">일상, 에세이, 생각을 기록하는 공간.</p>
        <p className="mt-6 text-sm text-slate-600">준비 중입니다.</p>
      </div>
    </div>
  );
}
