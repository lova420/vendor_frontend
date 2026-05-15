import Image from "next/image";

export function Logo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const dimensions = size === "small" ? 28 : size === "large" ? 48 : 36;
  const textSize = size === "small" ? "text-sm" : size === "large" ? "text-xl" : "text-base";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative animate-float" style={{ width: dimensions, height: dimensions }}>
        <Image
          src="/logo.png"
          alt="MagickVoice Logo"
          width={dimensions}
          height={dimensions}
          className="object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]"
          priority
        />
      </div>
      <span className={`${textSize} font-bold tracking-tight text-zinc-100`}>
        Magick<span className="bg-gradient-to-r from-brand-purple to-blue-400 bg-clip-text text-transparent">Voice</span>
      </span>
    </div>
  );
}
