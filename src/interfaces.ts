import { AdurcModel } from '@adurc/core';
import { AdurcField } from '@adurc/core/dist/interfaces/model';

export interface HasuraField {
    info: AdurcField;
    name: string;
    isPk: boolean;
}

export interface HasuraModel {
    info: AdurcModel;
    name: string;
    fields: HasuraField[];
    pkFields: HasuraField[];
}