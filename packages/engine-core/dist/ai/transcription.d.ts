import { type AiCallContext } from "./provider.js";
export interface TranscriptionSegment {
    start: number;
    end: number;
    text: string;
    speaker?: string;
}
export interface TranscriptionResult {
    engine: "whisper_local" | "whisper_api";
    language: string | null;
    fullText: string;
    segments: TranscriptionSegment[];
    processingTimeMs: number;
}
/**
 * Meeting transcription. Prefers a local whisper.cpp binary
 * (WHISPER_CPP_PATH + WHISPER_CPP_MODEL_PATH) for zero marginal cost;
 * falls back to the OpenAI Whisper API when local is unavailable.
 */
export declare function transcribeAudio(audioBuffer: Buffer, fileName: string, ctx: AiCallContext): Promise<TranscriptionResult>;
//# sourceMappingURL=transcription.d.ts.map