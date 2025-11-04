
export interface CreationMethod {
    type: 'ai' | 'manual';
    title: string;
    description: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    price: string;
    creationMethods: CreationMethod[];
}
