import LessonCard from '@/components/examples/LessonCard';
import KnowledgeCard from '@/components/examples/KnowledgeCard';

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Deep Linking Examples</h1>
        <p className="text-gray-600 mb-8">
          These components demonstrate how to link to the gallery from other modules
          like lessons and knowledge cards.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Lesson Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LessonCard
                title="Introduction to Environmental Design"
                description="Learn the fundamentals of environmental design and spatial planning."
                relatedWorkId={1}
              />
              <LessonCard
                title="Product Design Principles"
                description="Explore user-centered design and ergonomics in product development."
                relatedWorkId={2}
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Knowledge Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KnowledgeCard
                topic="Brand Identity Systems"
                content="A comprehensive visual identity system ensures consistent brand communication across all touchpoints."
                relatedDiscipline="视传"
                relatedWorkId={3}
              />
              <KnowledgeCard
                topic="Interactive Media Art"
                content="Digital media art combines technology and creativity to create immersive experiences."
                relatedDiscipline="数媒"
                relatedWorkId={4}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
