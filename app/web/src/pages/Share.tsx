import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from '../api';
import { Top, toast, Spinner } from '../ui';
import { ContractCard } from '../contract';

export default function Share() {
  const { token = '' } = useParams(); const nav = useNavigate(); const [d, setD] = useState<any>(null); const [err, setErr] = useState('');
  useEffect(() => { get(`/share/${token}`).then(setD).catch((e) => { setErr(e.message); toast(e.message); }); }, [token]);
  return (
    <div className="shell" style={{ gridTemplateColumns: '1fr', maxWidth: 560 }}><div className="pane main">
      <Top onBack={() => nav('/')} title="قرارداد اشتراک‌گذاری‌شده" sub={d?.shared_by ? `فرستنده: ${d.shared_by}` : ''} />
      <div className="body pad">{err && <div className="err">{err}</div>}{!d && !err && <Spinner />}{d && <ContractCard c={d.contract} allowAsk={d.mine} />}{d && !d.mine && <p className="hint" style={{ marginTop: 10 }}>این قرارداد را کسی برای شما فرستاده. اگر طرف آن باشید، امضای شما همین‌جا ثبت می‌شود؛ وگرنه فقط می‌بینید.</p>}</div>
    </div></div>
  );
}
