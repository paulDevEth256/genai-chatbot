export const metadata = {
  title: "ChatGPT UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      {" "}
      {/* <-- Enables dark mode by default */}
      <body>{children}</body>
    </html>
  );
}
