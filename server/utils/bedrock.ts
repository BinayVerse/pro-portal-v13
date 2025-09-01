import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const config = useRuntimeConfig();

const bedrock = new BedrockRuntimeClient({
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
    },
});

export async function getEmbeddings(texts: string[]) {
    if (!texts.length) return [];

    const command = new InvokeModelCommand({
        modelId: "cohere.embed-english-v3",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            texts,
            input_type: "search_document",
            embedding_types: ["float"],
        }),
    });

    const response = await bedrock.send(command);
    const body = await response.body.transformToString();
    const parsed = JSON.parse(body);

    if (!parsed.embeddings?.float) {
        throw new Error("Cohere did not return embeddings");
    }

    return parsed.embeddings.float;
}
