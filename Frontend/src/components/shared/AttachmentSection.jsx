import React from "react";
import Card from "../ui/Card";
import DocIcon from "../ui/DocIcon";

// ─── ATTACHMENT SECTION ───────────────────────────────────────────────────────
// UI works fully — files appear in the list, can be removed.
// Files are NOT sent to backend yet (Phase 2 = Cloudinary integration).
const AttachmentSection = ({ documents, onAddDocument, onRemoveDocument }) => (
    <Card title="Attachment Information">
        <div className="space-y-3">
            {documents.length > 0 && (
                <ul className="space-y-2">
                    {documents.map((doc) => (
                        <li
                            key={doc.id}
                            className="flex items-center justify-between rounded-xl border px-4 py-2.5"
                            style={{ borderColor: "#d1cdc7", backgroundColor: "#faf9f7" }}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <DocIcon />
                                <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemoveDocument(doc.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-3 shrink-0 text-lg leading-none"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150 cursor-pointer">
                <span className="text-lg leading-none">+</span> Add Document
                <input type="file" className="hidden" onChange={onAddDocument} />
            </label>
        </div>
    </Card>
);

export default AttachmentSection;