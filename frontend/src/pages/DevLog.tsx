import Navbar from "../components/Navbar";

export default function DevLog() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="text-4xl">📋</span>
        <h1 className="mt-4 text-2xl font-bold text-white">개발로그</h1>
        <p className="mt-2 text-slate-400">프로젝트 빌드 과정과 기술적 의사결정 기록.</p>
        <p className="mt-6 text-sm text-slate-600">준비 중입니다.</p>
      </div>
    </div>
  );
}
