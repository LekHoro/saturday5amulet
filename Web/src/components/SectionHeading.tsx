export default function SectionHeading({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{children}</h2>
      <div
        className={
          center
            ? "mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
            : "mt-2 h-px w-16 bg-gradient-to-r from-gold via-gold-light to-transparent"
        }
      />
    </div>
  );
}
