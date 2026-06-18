declare module 'react-leaflet' {
  import { ComponentType, ReactNode } from 'react';
  export const MapContainer: ComponentType<any>;
  export const TileLayer: ComponentType<any>;
  export const Marker: ComponentType<any>;
  export const Popup: ComponentType<any>;
  export const useMap: () => any;
}

declare module 'jspdf' {
  export class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    addImage(data: string, type: string, x: number, y: number, w: number, h: number): void;
    setFontSize(size: number): void;
    text(text: string, x: number, y: number, options?: any): void;
    save(filename: string): void;
    internal: { getNumberOfPages: () => number };
    addPage(): void;
  }
}

declare module 'html2canvas' {
  function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
