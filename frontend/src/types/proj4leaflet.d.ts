declare module 'proj4' {
    const proj4: any;
    export default proj4;
}

declare module 'proj4leaflet' {
    export const CRS: any;
    export const Proj: any;
}

declare global {
    module 'leaflet' {
        namespace L {
            namespace Proj {
                class CRS {
                    constructor(code: string, projection: string, options: any);
                }
            }
            interface Proj {
                CRS: {
                    new(code: string, projection: string, options: any): L.CRS;
                };
            }
        }
    }

    interface Leaflet {
        Proj: L.Proj;
    }

    interface L extends Leaflet {}
}