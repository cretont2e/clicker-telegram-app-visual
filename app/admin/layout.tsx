import { headers } from 'next/headers';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = headers();

    // 접속자 IP 확인
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';

    // 허용된 IP 목록
    const allowedIps = ['127.0.0.1', '128.134.199.105', '121.166.200.172', '175.123.204.160', '221.168.213.72'];

    const isAuthorized = allowedIps.includes(ip.trim());

    if (!isAuthorized) {
        return <div className="text-white">Unauthorized - Your IP: {ip}</div>;
    }

    return (
        <>
            {children}
        </>
    );
}
