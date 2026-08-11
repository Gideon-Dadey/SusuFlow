import { cn, getAvatarTone, getInitials } from "@/lib/utils";

type CompanyAvatarProps = {
  firstName?: string;
  lastName?: string;
  src?: string | null;
  seed?: string;
  className?: string;
};

export function CompanyAvatar({
  firstName,
  lastName,
  src,
  seed,
  className,
}: CompanyAvatarProps) {
  const tone = getAvatarTone(seed || `${firstName ?? ""}${lastName ?? ""}`);

  return (
    <span
      className={cn("company-avatar", `company-avatar-tone-${tone}`, className)}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        getInitials(firstName, lastName)
      )}
    </span>
  );
}
