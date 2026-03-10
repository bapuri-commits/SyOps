export default function Footer() {
  return (
    <footer className="text-center text-xs text-slate-500">
      <p>Contabo VPS &middot; Ubuntu 24.04 &middot; 6 vCPU / 12 GB</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} syworkspace.cloud</p>
    </footer>
  );
}
