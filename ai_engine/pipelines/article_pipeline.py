from ai_engine.pipelines.content_pipeline import ContentPipeline


class ArticlePipeline:
    def __init__(self):
        self.pipeline = ContentPipeline()

    def process(self, url: str, raw_text: str | None = None) -> dict:
        return self.pipeline.run(url=url, content_type="article", raw_text=raw_text)


article_pipeline = ArticlePipeline()
