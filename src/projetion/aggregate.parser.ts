import { FieldNode, SelectionSetNode } from 'graphql';
import { GraphQLArguments } from './arguments';
import { HasuraModel } from '../interfaces';
import { ProjectionInfoMeta, ProjectionInfo } from '@adurc/core/dist/interfaces/projection';

export class ProjectionAggregateParser {

    public static parseAggregateFieldAggregate(model: HasuraModel, field: FieldNode): ProjectionInfoMeta {
        if (field.name.value !== 'aggregate') {
            throw new Error();
        }

        if (!field.selectionSet) {
            throw new Error();
        }

        const output: ProjectionInfo = {
            type: 'expand',
            name: 'aggregate',
            fields: field.selectionSet.selections.map<ProjectionInfoMeta>(x => {
                if (x.kind !== 'Field') {
                    throw new Error();
                }
                if (x.name.value === 'count') {
                    return {
                        type: 'field',
                        name: 'count',
                    };
                }
                return {
                    type: 'expand',
                    name: x.name.value, // aggregator 
                    fields: x.selectionSet.selections.map<ProjectionInfoMeta>(y => {
                        if (y.kind !== 'Field') {
                            throw new Error();
                        }
                        const field = model.fields.find(c => c.name === y.name.value);
                        return {
                            type: 'field',
                            name: field.info.name,
                        };
                    }),
                };
            }),
        };

        return output;
    }

    public static parseAggregateSelectionSet(models: ReadonlyArray<HasuraModel>, model: HasuraModel, selectionSet: SelectionSetNode): ProjectionInfoMeta[] {
        const output: ProjectionInfoMeta[] = [];

        for (const selection of selectionSet.selections) {
            if (selection.kind !== 'Field') {
                throw new Error();
            }

            switch (selection.name.value) {
                case 'aggregate':
                    output.push(this.parseAggregateFieldAggregate(model, selection));
                    break;
                default:
                    throw new Error();
            }
        }

        return output;
    }

    public static parseAggregateField(models: ReadonlyArray<HasuraModel>, model: HasuraModel, field: FieldNode): ProjectionInfo {
        const output: ProjectionInfo = {
            type: 'expand',
            name: model.info.name,
            args: GraphQLArguments.parse(field.arguments, null),
            fields: this.parseAggregateSelectionSet(models, model, field.selectionSet),
        };

        return output;
    }

}