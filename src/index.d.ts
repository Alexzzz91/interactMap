import { BinderType } from "./types/editorVars";

export {};

declare global {
    interface Window {
        editorVars: {
            WALLS: [];
            ROOM: [];
            OBJDATA: [];
            HISTORY: [];
            lineIntersection?: undefined;
            binder?: {
                type?: BinderType;
            };
            lengthTemp?: undefined;
            METER: number;
            factor: number;
            wallListRun: any[];
            equation1?: {
                A: string; 
                B: string;
            };
            equation2?: {
                A: string; 
                B: string;
            };
        };
    }
}