import { ChatRequest, ChatResponse, SessionDataResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function filesToBase64(files: File[]): Promise<string[]> {
    return Promise.all(files.map(fileToBase64));
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const detail = errData?.detail || `Status ${response.status}`;
            return {
                session_id: request.session_id || "default",
                answer: `I encountered a styling issue (${detail}). Please try rephrasing or asking for outfit suggestions!`,
                images: [],
            };
        }

        return await response.json();
    } catch (err: any) {
        console.warn("API sendMessage warning:", err?.message || err);
        return {
            session_id: request.session_id || "default",
            answer: "I'm having trouble connecting to the backend styling engine at the moment. Please verify the service is running and try your question again.",
            images: [],
        };
    }
}

export async function sendChatMessage(
    message: string,
    images: string[] = [],
    sessionId?: string,
    modelPhoto?: string
): Promise<{
    reply: string;
    retrieved_images?: any[];
    analysis?: any;
    products?: any[];
}> {
    const res = await sendMessage({
        query: message,
        session_id: sessionId || null,
        images: images.length > 0 ? images : null,
        model_image: modelPhoto || null,
    });
    return {
        reply: res.answer,
        retrieved_images: res.images || [],
        analysis: res.analysis,
        products: res.products || [],
    };
}



export async function getSession(sessionId: string): Promise<SessionDataResponse | null> {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
    }

    return response.json();
}

export async function getWardrobe(): Promise<{ items: import("@/types").WardrobeItem[]; total: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/wardrobe`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            return { items: [], total: 0 };
        }
        return response.json();
    } catch {
        return { items: [], total: 0 };
    }
}

export async function addToWardrobe(image: string, label: string): Promise<{ success: boolean; id: string; label: string }> {
    const response = await fetch(`${API_BASE_URL}/wardrobe/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, label }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `API error: ${response.status}`);
    }
    return response.json();
}

export async function seedWardrobe(): Promise<{ success: boolean; added: number; total: number; errors: unknown[] }> {
    const response = await fetch(`${API_BASE_URL}/wardrobe/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `API error: ${response.status}`);
    }
    return response.json();
}