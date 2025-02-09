"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function QRComponent({ contentCode, contentName }: { contentCode?: string; contentName?: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (!contentCode || contentCode.trim() === "") {
      console.warn("QRコード生成をスキップしました: contentCode が空です");
      return;
    }

    QRCode.toDataURL(contentCode, { width: 256, margin: 2, errorCorrectionLevel: "L" })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QRコード生成エラー:", err));
  }, [contentCode]);

  const handleDownloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${contentName}_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h3>QRコード</h3>
      {qrCodeUrl ? (
        <>
          <img src={qrCodeUrl} alt="QRコード" width={256} height={256} />
          <br />
          <button onClick={handleDownloadQRCode} className="btn-secondary">
            QRコードをダウンロード
          </button>
        </>
      ) : (
        <p>QRコードを生成できませんでした</p>
      )}
    </div>
  );
}
