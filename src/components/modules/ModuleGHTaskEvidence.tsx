import React, { useState } from 'react';
import { 
  CheckSquare, 
  UploadCloud, 
  Hash, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Camera, 
  Scale, 
  MapPin, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EvidenceRecord, UserRole } from '../../types';
import { MOCK_EVIDENCE_RECORDS } from '../../data/mockData';
import { computeSHA256, formatShortHash } from '../../utils/crypto';

interface ModuleGHProps {
  currentRole: UserRole;
  isOnline: boolean;
  onSyncComplete?: () => void;
}

export const ModuleGHTaskEvidence: React.FC<ModuleGHProps> = ({
  currentRole,
  isOnline,
  onSyncComplete,
}) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(MOCK_EVIDENCE_RECORDS);
  const [isCapturing, setIsCapturing] = useState(false);
  const [evidenceType, setEvidenceType] = useState<'weigh_ticket' | 'gps_checkin' | 'photo'>('weigh_ticket');
  const [metricValue, setMetricValue] = useState<string>('210.5');
  const [note, setNote] = useState<string>('ขยะอินทรีย์รอบบ่าย แผงค้าผลไม้ฝั่งทิศเหนือ');
  const [liveHashPreview, setLiveHashPreview] = useState<string>('');

  const handleLiveInputChange = async (val: string, n: string) => {
    setMetricValue(val);
    setNote(n);
    const hash = await computeSHA256(`climate_evidence_${Date.now()}_${val}_${n}`);
    setLiveHashPreview(hash);
  };

  const handleCaptureEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCapturing(true);

    const rawPayload = `evidence_payload_${evidenceType}_${metricValue}_${note}_${new Date().toISOString()}`;
    const hash = await computeSHA256(rawPayload);

    const newRecord: EvidenceRecord = {
      id: `evi-${Date.now()}`,
      projectId: 'proj-pilot-market-01',
      taskTitle: evidenceType === 'weigh_ticket' 
        ? 'บันทึกชั่งน้ำหนักขยะอินทรีย์' 
        : evidenceType === 'gps_checkin' 
        ? 'บันทึกผู้ใช้บริการจุดคลายร้อน' 
        : 'ภาพถ่ายตรวจสภาพแนวระบายน้ำ',
      evidenceType: evidenceType,
      evidenceLabelTh: evidenceType === 'weigh_ticket' 
        ? 'ตั๋วชั่งน้ำหนักขยะดิจิทัล' 
        : evidenceType === 'gps_checkin' 
        ? 'บันทึกพิกัด GPS Check-in' 
        : 'ภาพถ่ายและพิกัดตรวจสอบ',
      fileHash: hash,
      capturedAt: new Date().toISOString(),
      capturedBy: currentRole === 'community_member' ? 'ตัวแทนตลาด (คุณ)' : 'Field Operator (คุณ)',
      syncedFromOffline: !isOnline,
      status: isOnline ? 'server_confirmed' : 'local_pending',
      metricPayload: {
        value: parseFloat(metricValue) || 0,
        unit: evidenceType === 'weigh_ticket' ? 'กก.' : evidenceType === 'gps_checkin' ? 'คน' : 'จุด',
        note: note,
      },
    };

    setTimeout(() => {
      setEvidenceList([newRecord, ...evidenceList]);
      setIsCapturing(false);
      if (isOnline) {
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch {
          // ignore
        }
      }
    }, 400);
  };

  const handleFlushOfflineQueue = () => {
    setEvidenceList((prev) =>
      prev.map((item) => {
        if (item.status === 'local_pending') {
          return {
            ...item,
            status: 'server_confirmed',
            syncedFromOffline: true,
          };
        }
        return item;
      })
    );
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    if (onSyncComplete) onSyncComplete();
  };

  const pendingCount = evidenceList.filter((e) => e.status === 'local_pending').length;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200 flex flex-col justify-between h-full relative overflow-hidden">

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-600 font-bold uppercase tracking-wider">
              MODULE G & H · MRV & CRYPTO EVIDENCE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {isOnline ? 'SERVER ACK SYNCED' : 'OFFLINE LOCAL QUEUE'}
            </span>
          </div>
        </div>

        {/* Offline Sync Banner if pending */}
        {pendingCount > 0 && isOnline && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              <span className="text-xs text-amber-800">
                พบ {pendingCount} รายการบันทึกค้างใน IndexedDB จากช่วงออฟไลน์
              </span>
            </div>
            <button
              onClick={handleFlushOfflineQueue}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Sync ขึ้นระบบ
            </button>
          </div>
        )}

        {/* Fast Evidence Capture Form */}
        <form onSubmit={handleCaptureEvidence} className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-mono text-slate-600 font-bold block mb-2">
            บันทึกหลักฐานผลลัพธ์หน้างาน (Live SHA-256 Ingestion):
          </span>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setEvidenceType('weigh_ticket');
                handleLiveInputChange('210.5', note);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                evidenceType === 'weigh_ticket'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>ตั๋วชั่งขยะ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEvidenceType('gps_checkin');
                handleLiveInputChange('72', note);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                evidenceType === 'gps_checkin'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>จุดคลายร้อน</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEvidenceType('photo');
                handleLiveInputChange('1', note);
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                evidenceType === 'photo'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>ภาพตรวจงาน</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-1">
                {evidenceType === 'weigh_ticket' ? 'น้ำหนักขยะ (กิโลกรัม)' : evidenceType === 'gps_checkin' ? 'จำนวนผู้รับบริการ (คน)' : 'จำนวนจุดตรวจ (จุด)'}:
              </label>
              <input
                type="number"
                step="0.5"
                value={metricValue}
                onChange={(e) => handleLiveInputChange(e.target.value, note)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-climate-500 focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-1">
                รายละเอียด / บันทึกเพิ่มเติม:
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => handleLiveInputChange(metricValue, e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-climate-500 focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                required
              />
            </div>
          </div>

          {/* Submit and Live Hash Preview */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 w-full sm:w-auto truncate">
              <Hash className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span>SHA-256: {liveHashPreview ? formatShortHash(liveHashPreview) : 'คำนวณสดขณะกรอก...'}</span>
            </div>

            <button
              type="submit"
              disabled={isCapturing}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-climate-600 hover:bg-climate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-subtle-emerald focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <UploadCloud className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isCapturing ? 'กำลังเข้ารหัส...' : 'บันทึกหลักฐาน MRV'}</span>
            </button>
          </div>
        </form>

        {/* Evidence Stream List */}
        <div className="mt-4 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {evidenceList.map((record) => (
            <div
              key={record.id}
              className="p-3 rounded-2xl bg-white border border-slate-100 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{record.taskTitle}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                    record.status === 'server_confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {record.status === 'server_confirmed' ? 'SERVER CONFIRMED' : 'LOCAL QUEUE'}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="font-mono font-bold text-emerald-600">
                    {record.metricPayload.value} {record.metricPayload.unit}
                  </span>
                  <span className="text-slate-500">({record.metricPayload.note})</span>
                </div>

                <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span>ผู้บันทึก: {record.capturedBy}</span>
                  <span>·</span>
                  <span className="text-slate-500">Hash: {formatShortHash(record.fileHash)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer Conflict Resolution Explainer */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Server-Ack First: ห้ามแสดงสำเร็จก่อนได้ Ack จากเซิร์ฟเวอร์</span>
        <span className="font-mono text-emerald-600">Immutable Cryptographic Log</span>
      </div>

    </div>
  );
};
