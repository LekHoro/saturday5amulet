export default function SectionHeading({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="font-heading text-2xl font-bold text-gold">{children}</h2>
      <div
        className={`mt-2 h-px w-16 bg-gradient-to-r from-gold via-gold-light to-transparent ${
          center ? "mx-auto bg-gradient-to-r from-transparent via-gold to-transparent w-24" : ""
        }`}
      />
    </div>
  );
}
