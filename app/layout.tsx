import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Nossa História de Amor — Site Romântico Personalizado',
  description: 'Eternize sua história de namoro ou casamento com fotos estilo polaroid, linha do tempo dos momentos do casal, contadores de tempo real e música personalizada.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
