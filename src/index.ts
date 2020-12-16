import { Adurc } from '@adurc/core';
import { AdurcDirectiveArgDefinition, AdurcObject } from '@adurc/core/dist/interfaces/model';
import { ApolloServer, IResolvers, ServerRegistration } from 'apollo-server-express';
import { DefinitionNode, DocumentNode, FieldDefinitionNode, FieldNode, InputObjectTypeDefinitionNode, InputValueDefinitionNode, ObjectTypeDefinitionNode, TypeNode } from 'graphql';
import { snakeCase } from 'snake-case';
import { HasuraField, HasuraModel } from './interfaces';
import { GraphQLExposureOptions } from './options';
import { ProjectionReadParser } from './projetion/read.parser';

export class HasuraExposure {

    private apolloServer: ApolloServer;
    private models: HasuraModel[] = [];

    public get adurc(): Adurc {
        return this.options.adurc;
    }

    constructor(
        private options: GraphQLExposureOptions,
    ) {
        this.buildHasuraModels();
        this.apolloServer = new ApolloServer({
            playground: true,
            typeDefs: this.buildDocument(),
            resolvers: this.buildResolvers(),
        });
    }

    public applyMiddleware(options: ServerRegistration): void {
        this.apolloServer.applyMiddleware(options);
    }

    private buildHasuraModels() {
        for (const model of this.options.adurc.models) {
            const fields = model.fields.map<HasuraField>(c => {
                const isPk = c.directives.findIndex(x => x.name === 'pk') >= 0;

                return {
                    info: c,
                    isPk,
                    name: snakeCase(c.name),
                };
            });

            const hasuraModel: HasuraModel = {
                info: model,
                name: snakeCase(model.name),
                pkFields: fields.filter(x => x.isPk),
                fields,
            };

            if (hasuraModel.pkFields.length === 0) {
                continue;
            }

            this.models.push(hasuraModel);
        }
    }

    private buildDocument(): DocumentNode {
        return {
            kind: 'Document',
            definitions: [
                ...this.buildDataServerScalarTypes(),
                ...this.buildModels(),
                this.buildQueryTypeRoot(),
                this.buildMutationTypeRoot(),
            ],
        };
    }

    private buildResolvers() {
        const resolvers: IResolvers = { Query: {}, Mutation: {} };

        for (const model of this.models) {
            resolvers.Query[model.name] = this.buildReadResolver(model);
            resolvers.Query[`${model.name}_aggregate`] = this.buildAggregateResolver();
            resolvers.Mutation[`insert_${model.name}`] = this.buildInsertResolver();
            resolvers.Mutation[`insert_${model.name}_one`] = this.buildInsertOneResolver();
            resolvers.Mutation[`update_${model.name}`] = this.buildUpdateResolver();
            resolvers.Mutation[`delete_${model.name}`] = this.buildDeleteResolver();

            if (model.pkFields.length > 0) {
                resolvers.Query[`${model.name}_by_pk`] = this.buildReadByPKResolver();
                resolvers.Mutation[`update_${model.name}_by_pk`] = this.buildUpdateByPKResolver();
                resolvers.Mutation[`delete_${model.name}_by_pk`] = this.buildDeleteByPKResolver();
            }
        }

        return resolvers;
    }

    private buildInsertResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.createMany(projection);
            // return this.processOutput(result);
        };
    }

    private buildInsertOneResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.createOne(projection);
            // return this.processOutput(result);
        };
    }

    private buildUpdateResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.updateMany(projection);
            // return this.processOutput(result);
        };
    }

    private buildDeleteResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.deleteMany(projection);
            // return this.processOutput(result);
        };
    }

    private buildUpdateByPKResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.updateByPK(projection);
            // return this.processOutput(result);
        };
    }

    private buildDeleteByPKResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.deleteByPK(projection);
            // return this.processOutput(model, result);
        };
    }

    private buildReadResolver(model: HasuraModel) {
        return async (_source, _args, _context, info) => {
            const fieldNode: FieldNode = info.fieldNodes[0];
            const projection = ProjectionReadParser.parseField(
                this.models,
                model,
                model.info.name,
                fieldNode,
                info.variableValues,
            );
            projection.name = model.info.name;
            const result = await this.adurc.read(projection);
            return this.processOutput(model, result);
        };
    }

    private buildReadByPKResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.readByPK(projection);
            // return this.processOutput(model, result);
        };
    }

    private buildAggregateResolver() {
        return async (_source, _args, _context) => {
            // const fieldNode: FieldNode = info.fieldNodes[0];
            // const projection = ProjectionParser.parseField(this.models, model, model.info.name, fieldNode, info.variableValues);
            // projection.name = model.info.name;
            // const result = await this.dataServer.aggregate(projection);
            // return result;
            // return this.processOutput(result);
        };
    }

    private processOutput(model: HasuraModel, result: Array<Record<string, unknown>> | Record<string, unknown> | unknown) {
        if (result instanceof Array) {
            const output: unknown[] = [];
            for (const item of result) {
                output.push(this.processOutputItem(model, item));
            }
            return output;
        } else if (typeof result === 'object' && result !== null) {
            return this.processOutputItem(model, result as Record<string, unknown>);
        } else {
            return result;
        }
    }

    private processOutputItem(model: HasuraModel, item: Record<string, unknown>) {
        const output: Record<string, unknown> = {};

        for (const prop in item) {
            if (Object.prototype.hasOwnProperty.call(item, prop)) {
                const field = model.fields.find(x => x.info.name === prop);
                const value = item[prop];
                const modelDest = this.models.find(x => field.info.type === x.info.name) ?? model;
                output[field.name] = this.processOutput(modelDest, value);
            }
        }

        return output;
    }

    private buildDataServerScalarTypes() {
        const output: DefinitionNode[] = [];

        const dataServerTypes = ['Date', 'Buffer'];

        for (const type of dataServerTypes) {
            output.push({
                kind: 'ScalarTypeDefinition',
                name: { kind: 'Name', value: type },
            });
        }

        return output;
    }

    private buildQueryTypeRootFind(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: model.name },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'limit' },
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: 'Int' },
                    }
                },
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'offset' },
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: 'Int' },
                    }
                },
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'where' },
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: `${model.name}_bool_exp` },
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'ListType',
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: model.name },
                    }
                }
            }
        };
    }

    private buildQueryTypeRootFindByPK(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `${model.name}_by_pk` },
            arguments: model.pkFields.map<InputValueDefinitionNode>(x => ({
                kind: 'InputValueDefinition',
                name: { kind: 'Name', value: x.name },
                type: {
                    kind: 'NonNullType',
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: this.transformDataServerTypeIntoGraphQLType(x.info.type) },
                    }
                }
            })),
            type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: model.name },
            }
        };
    }

    private buildQueryTypeRootAggregate(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `${model.name}_aggregate` },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'where' },
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: `${model.name}_bool_exp` },
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: `${model.name}_aggregate` },
                },
            }
        };
    }

    private buildQueryTypeRoot(): DefinitionNode {
        const fieldDefinition: FieldDefinitionNode[] = [];

        for (const model of this.models) {
            fieldDefinition.push(this.buildQueryTypeRootFind(model));
            fieldDefinition.push(this.buildQueryTypeRootAggregate(model));
            if (model.pkFields.length > 0) {
                fieldDefinition.push(this.buildQueryTypeRootFindByPK(model));
            }
        }

        const output: DefinitionNode = {
            kind: 'ObjectTypeDefinition',
            name: { kind: 'Name', value: 'Query' },
            fields: fieldDefinition,
        };

        return output;
    }

    private buildMutationInsertOne(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `insert_${model.name}_one` },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'object' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_insert_input` },
                        }
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: model.name },
                }
            }
        };
    }

    private buildMutationInsertMany(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `insert_${model.name}` },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'objects' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: {
                                    kind: 'NamedType',
                                    name: { kind: 'Name', value: `${model.name}_insert_input` },
                                },
                            }
                        }
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: `${model.name}_mutation_response` },
                }
            }
        };
    }

    private buildMutationUpdateMany(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `update_${model.name}` },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: '_set' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_set_input` },
                        },
                    }
                }, {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'where' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_bool_exp` },
                        },
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: `${model.name}_mutation_response` },
                }
            }
        };
    }

    private buildMutationDeleteMany(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `delete_${model.name}` },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'where' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_bool_exp` },
                        },
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: `${model.name}_mutation_response` },
                }
            }
        };
    }

    private buildMutationUpdatePK(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `update_${model.name}_by_pk` },
            arguments: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: '_set' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_set_input` },
                        },
                    }
                }, {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'pk_columns' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_pk_columns_input` },
                        },
                    }
                }
            ],
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: model.name },
                }
            }
        };
    }

    private buildMutationDeletePK(model: HasuraModel): FieldDefinitionNode {
        return {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: `delete_${model.name}_by_pk` },
            arguments: model.pkFields.map<InputValueDefinitionNode>(x => this.serializeFieldInput(x)),
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: model.name },
                }
            }
        };
    }

    private buildMutationTypeRoot(): DefinitionNode {
        const mutations: FieldDefinitionNode[] = [];

        for (const model of this.models) {
            mutations.push(this.buildMutationInsertOne(model));
            mutations.push(this.buildMutationInsertMany(model));
            mutations.push(this.buildMutationUpdateMany(model));
            mutations.push(this.buildMutationDeleteMany(model));

            if (model.pkFields.length > 0) {
                mutations.push(this.buildMutationUpdatePK(model));
                mutations.push(this.buildMutationDeletePK(model));
            }
        }

        const output: DefinitionNode = {
            kind: 'ObjectTypeDefinition',
            name: { kind: 'Name', value: 'Mutation' },
            fields: mutations,
        };

        return output;
    }

    private buildModelObject(model: HasuraModel): DefinitionNode {
        return {
            kind: 'ObjectTypeDefinition',
            name: { kind: 'Name', value: model.name },
            fields: model.fields.map(x => this.serializeFieldObject(x)),
        };
    }

    private buildModelColumnExp(model: HasuraModel, column: HasuraField): DefinitionNode {
        const singleOperators: string[] = ['_eq'];
        const arrayOperators: string[] = ['_in', '_nin'];

        const fieldType: TypeNode = {
            kind: 'NamedType',
            name: {
                kind: 'Name',
                value: this.transformDataServerTypeIntoGraphQLType(column.info.type)
            }
        };

        return {
            kind: 'InputObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_${column.name}_column_exp` },
            fields: [
                ...singleOperators.map<InputValueDefinitionNode>(x => ({
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: x },
                    type: fieldType
                })),
                ...arrayOperators.map<InputValueDefinitionNode>(x => ({
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: x },
                    type: {
                        kind: 'ListType',
                        type: fieldType,
                    }
                }))
            ]
        };
    }

    private buildModelBoolExp(model: HasuraModel): DefinitionNode {
        return {
            kind: 'InputObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_bool_exp` },
            fields: [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: '_and' },
                    type: {
                        kind: 'ListType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_bool_exp` }
                        }
                    }
                },
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: '_or' },
                    type: {
                        kind: 'ListType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_bool_exp` }
                        }
                    }
                },
                ...model.fields.map<InputValueDefinitionNode>(column => {
                    const modelType = this.models.find(x => x.info.name === column.info.type);
                    return {
                        kind: 'InputValueDefinition',
                        name: { kind: 'Name', value: column.name },
                        type: {
                            kind: 'NamedType',
                            name: {
                                kind: 'Name',
                                value: modelType
                                    ? `${modelType.name}_bool_exp`
                                    : `${model.name}_${column.name}_column_exp`
                            }
                        }
                    };
                })
            ],
        };
    }

    private buildModelAggregate(model: HasuraModel): ObjectTypeDefinitionNode {
        return {
            kind: 'ObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_aggregate` },
            fields: [
                {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'aggregate' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: `${model.name}_aggregate_result` },
                        }
                    }
                }
            ],
        };
    }

    private buildModelAggregateResult(model: HasuraModel): ObjectTypeDefinitionNode {
        return {
            kind: 'ObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_aggregate_result` },
            fields: [
                {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'count' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'Int' },
                        }
                    }
                }
            ],
        };
    }

    private buildModelInput(model: HasuraModel): InputObjectTypeDefinitionNode {
        return {
            kind: 'InputObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_input` },
            fields: model.fields.map(x => this.serializeFieldInput(x))
        };
    }

    private buildModelInsertInput(model: HasuraModel): InputObjectTypeDefinitionNode {
        return {
            kind: 'InputObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_insert_input` },
            fields: model.fields.map(x => this.serializeFieldInsertInput(x)).filter(x => x !== null),
        };
    }

    private buildModelPKColumnsInput(model: HasuraModel): InputObjectTypeDefinitionNode {
        return {
            kind: 'InputObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_pk_columns_input` },
            fields: model.pkFields.map(x => this.serializeFieldInput(x))
        };
    }

    private buildModelMutationResponse(model: HasuraModel): ObjectTypeDefinitionNode {
        return {
            kind: 'ObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_mutation_response` },
            fields: [
                {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'affected_rows' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'NamedType',
                            name: { kind: 'Name', value: 'Int' },
                        }
                    }
                },
                {
                    kind: 'FieldDefinition',
                    name: { kind: 'Name', value: 'returning' },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: {
                                    kind: 'NamedType',
                                    name: { kind: 'Name', value: model.name },
                                }
                            }
                        }
                    }
                },
            ]
        };
    }

    private buildModelSetInput(model: HasuraModel): InputObjectTypeDefinitionNode {
        return {
            kind: 'InputObjectTypeDefinition',
            name: { kind: 'Name', value: `${model.name}_set_input` },
            fields: model.fields.map(x => this.serializeFieldSetInput(x)).filter(x => x !== null),
        };
    }

    private buildModels(): DefinitionNode[] {
        const output: DefinitionNode[] = [];

        for (const model of this.models) {
            output.push(this.buildModelObject(model));
            output.push(this.buildModelBoolExp(model));
            output.push(this.buildModelAggregate(model));
            output.push(this.buildModelAggregateResult(model));
            output.push(this.buildModelInput(model));
            output.push(this.buildModelInsertInput(model));
            output.push(this.buildModelMutationResponse(model));
            output.push(this.buildModelSetInput(model));

            if (model.pkFields.length > 0) {
                output.push(this.buildModelPKColumnsInput(model));
            }

            for (const field of model.fields) {
                if (this.isScalarType(field.info.type)) {
                    output.push(this.buildModelColumnExp(model, field));
                }
            }
        }

        return output;
    }

    private isScalarType(type: string) {
        return this.adurc.models.findIndex(x => x.name === type) === -1;
    }

    private serializeFieldSetInput(field: HasuraField) {
        const primary = field.info.directives.find(x => x.name === 'pk');

        if (primary) {
            return null;
        }

        const modelDest = this.models.find(x => x.info.name === field.info.type);
        let type: TypeNode = {
            kind: 'NamedType',
            name: { kind: 'Name', value: modelDest ? `${modelDest.name}_set_input` : this.transformDataServerTypeIntoGraphQLType(field.info.type) }
        };

        if (field.info.collection) {
            type = {
                kind: 'ListType',
                type,
            };
        }

        const output: InputValueDefinitionNode = {
            kind: 'InputValueDefinition',
            name: { kind: 'Name', value: field.name },
            type,
        };
        return output;
    }

    private serializeFieldInsertInput(field: HasuraField) {
        const primary = field.info.directives.find(x => x.name === 'pk');

        if (primary && primary.args.generated) {
            return null;
        }

        const modelDest = this.models.find(x => x.info.name === field.info.type);
        let type: TypeNode = {
            kind: 'NamedType',
            name: { kind: 'Name', value: modelDest ? `${modelDest.name}_insert_input` : this.transformDataServerTypeIntoGraphQLType(field.info.type) }
        };

        if (field.info.collection) {
            type = {
                kind: 'ListType',
                type,
            };
        }

        const hasDefaultValue = field.info.directives.findIndex(x => x.name === 'default');
        if (field.info.nonNull && !hasDefaultValue) {
            type = {
                kind: 'NonNullType',
                type,
            };
        }

        const output: InputValueDefinitionNode = {
            kind: 'InputValueDefinition',
            name: { kind: 'Name', value: field.name },
            type,
        };
        return output;
    }

    private serializeFieldInput(field: HasuraField) {
        const modelDest = this.models.find(x => x.info.name === field.info.type);

        let type: TypeNode = {
            kind: 'NamedType',
            name: { kind: 'Name', value: modelDest ? `${modelDest.name}_input` : this.transformDataServerTypeIntoGraphQLType(field.info.type) }
        };

        if (field.info.collection) {
            type = {
                kind: 'ListType',
                type,
            };
        }

        if (field.info.nonNull) {
            type = {
                kind: 'NonNullType',
                type,
            };
        }

        const output: InputValueDefinitionNode = {
            kind: 'InputValueDefinition',
            name: { kind: 'Name', value: field.name },
            type,
        };
        return output;
    }

    private serializeFieldObject(field: HasuraField) {
        const modelDest = this.models.find(x => x.info.name === field.info.type);
        let type: TypeNode = {
            kind: 'NamedType',
            name: { kind: 'Name', value: modelDest ? modelDest.name : this.transformDataServerTypeIntoGraphQLType(field.info.type) }
        };

        if (field.info.collection) {
            type = {
                kind: 'ListType',
                type,
            };
        }

        if (field.info.nonNull) {
            type = {
                kind: 'NonNullType',
                type,
            };
        }

        const output: FieldDefinitionNode = {
            kind: 'FieldDefinition',
            name: { kind: 'Name', value: field.name },
            arguments: modelDest ? [
                {
                    kind: 'InputValueDefinition',
                    name: { kind: 'Name', value: 'where' },
                    type: {
                        kind: 'NamedType',
                        name: { kind: 'Name', value: `${modelDest.name}_bool_exp` },
                    }
                }
            ] : [],
            type,
        };
        return output;
    }


    private transformDataServerTypeIntoGraphQLType(valueType: string | AdurcObject<AdurcDirectiveArgDefinition>) {
        switch (valueType) {
            case 'string':
                return 'String';
            case 'boolean':
                return 'Boolean';
            case 'uuid':
                return 'ID';
            case 'int':
                return 'Int';
            case 'float':
                return 'Float';
            case 'date':
                return 'Date';
            case 'buffer':
                return 'Buffer';
            default:
                throw new Error(`Unknown value type ${valueType}`);
        }
    }
}