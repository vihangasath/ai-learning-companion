from backend.app.ai_engine.pipelines.content_pipeline import ContentPipeline


class YouTubePipeline:
    def __init__(self):
        self.pipeline = ContentPipeline()

    def process(self, url: str, transcript: str | None = None) -> dict:
        return self.pipeline.run(url=url, content_type="youtube", transcript=transcript)


youtube_pipeline = YouTubePipeline()
