import { ProjectionInfo, ProjectionInfoMeta } from '@adurc/core/dist/interfaces/projection';
import { SelectionNode, SelectionSetNode, FieldNode, valueFromASTUntyped } from 'graphql';
import { HasuraModel } from '../interfaces';
import { META_FIELDS } from './types';


export class ProjectionReadParser {

    public static parseSelection(models: HasuraModel[], model: HasuraModel, selection: SelectionNode, variables: Record<string, string>): ProjectionInfoMeta {
        if (selection.kind === 'Field') {
            const field = model.fields.find(x => x.name === selection.name.value);
            if (!selection.selectionSet) {
                return { type: 'field', name: field.info.name };
            } else {
                const modelDest = models.find(x => x.info.name === field.info.type) ?? model;
                return this.parseField(models, modelDest, field.info.name, selection, variables);
            }
        } else {
            throw new Error(`Not implemented ${selection.kind}`);
        }
    }

    public static parseSelectionSet(models: HasuraModel[], model: HasuraModel, selectionSet: SelectionSetNode, variables: Record<string, string>): ProjectionInfoMeta[] {
        const output: ProjectionInfoMeta[] = [];

        for (const selection of selectionSet.selections) {
            if (selection.kind === 'Field' && META_FIELDS.indexOf(selection.name.value) >= 0) {
                continue;
            }
            output.push(this.parseSelection(models, model, selection, variables));
        }

        return output;
    }

    public static parseWhere(models: HasuraModel[], model: HasuraModel, where: Record<string, unknown>): Record<string, unknown> {
        const output: Record<string, unknown> = {};
        for (const property in where) {
            if (Object.prototype.hasOwnProperty.call(where, property)) {
                const value = where[property];
                const field = model.fields.find(x => x.name === property);
                const destModel = models.find(x => x.info.name === field.info.type);
                if (destModel) {
                    output[field.info.name] = this.parseWhere(models, destModel, value as Record<string, unknown>);
                } else {
                    output[field.info.name] = value;
                }
            }
        }
        return output;
    }

    public static parseField(models: HasuraModel[], model: HasuraModel, fieldName: string, field: FieldNode, variables: Record<string, string>): ProjectionInfo {
        const args: Record<string, unknown> = {};

        for (const argument of field.arguments) {
            const value = valueFromASTUntyped(argument.value, variables);
            switch (argument.name.value) {
                case 'where':
                    args.where = this.parseWhere(models, model, value);
                    break;
                case 'limit':
                case 'offset':
                    args[argument.name.value] = value;
                    break;
            }
        }

        const output: ProjectionInfo = {
            type: 'expand',
            name: fieldName,
            args,
            fields: this.parseSelectionSet(models, model, field.selectionSet, variables),
        };

        return output;
    }
}