"use client";

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Sparkles, Bug, Heart, BookOpen, Video } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function EducationPage() {
  const { t } = useTranslation();

  const educationTopics = [
    {
      icon: Droplet,
      title: t('safeWater'),
      color: 'blue',
      content: [
        'Always boil water for at least 20 minutes before drinking',
        'Store water in clean, covered containers',
        'Check water color, smell, and taste before use',
        'Use water purification tablets when boiling is not possible',
        'Clean water storage containers regularly'
      ]
    },
    {
      icon: Sparkles,
      title: t('hygiene'),
      color: 'green',
      content: [
        'Wash hands with soap before eating and after using toilet',
        'Keep fingernails short and clean',
        'Cover food to protect from flies and insects',
        'Use clean utensils for cooking and eating',
        'Maintain personal cleanliness and bath regularly'
      ]
    },
    {
      icon: Heart,
      title: t('sanitation'),
      color: 'purple',
      content: [
        'Use toilets, avoid open defecation',
        'Keep surroundings clean and free of waste',
        'Dispose garbage properly in designated areas',
        'Keep drainage systems clean and unclogged',
        'Maintain cleanliness in community water sources'
      ]
    },
    {
      icon: Bug,
      title: t('diseasePrevention'),
      color: 'red',
      content: [
        'Use mosquito nets while sleeping',
        'Eliminate standing water around homes',
        'Seek medical help immediately if symptoms appear',
        'Complete full course of prescribed medicines',
        'Get vaccinated as per healthcare guidelines'
      ]
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-sky-500/15',
      text: 'text-sky-400'
    },
    green: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400'
    },
    purple: {
      bg: 'bg-violet-500/15',
      text: 'text-violet-400'
    },
    red: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400'
    }
  };

  const resources = [
    {
      type: 'video',
      title: 'Safe Water Practices - WHO Guidelines',
      duration: '5:32',
      thumbnail: 'https://img.youtube.com/vi/06X5HYynP5E/maxresdefault.jpg',
      youtubeId: '06X5HYynP5E', // Water safety practices
      description: 'Learn essential water safety practices recommended by WHO'
    },
    {
      type: 'video',
      title: 'Proper Hand Washing Techniques',
      duration: '3:15',
      thumbnail: 'https://img.youtube.com/vi/3PmVJQUCm4E/maxresdefault.jpg',
      youtubeId: '3PmVJQUCm4E', // Hand washing demonstration
      description: 'Step-by-step guide to proper hand hygiene'
    },
    {
      type: 'video',
      title: 'Preventing Waterborne Diseases',
      duration: '7:48',
      thumbnail: 'https://img.youtube.com/vi/BjOFzESOJzc/maxresdefault.jpg',
      youtubeId: 'BjOFzESOJzc', // Disease prevention
      description: 'Understanding and preventing common waterborne illnesses'
    },
    {
      type: 'video',
      title: 'Community Health & Sanitation',
      duration: '6:22',
      thumbnail: 'https://img.youtube.com/vi/TqKQ94DtS54/maxresdefault.jpg',
      youtubeId: 'TqKQ94DtS54', // Sanitation practices
      description: 'Building healthier communities through proper sanitation'
    },
    {
      type: 'video',
      title: 'Mosquito Control & Disease Prevention',
      duration: '4:56',
      thumbnail: 'https://img.youtube.com/vi/MmONx8OKm8I/maxresdefault.jpg',
      youtubeId: 'MmONx8OKm8I', // Mosquito prevention
      description: 'Effective strategies to control mosquitos and prevent vector-borne diseases'
    },
    {
      type: 'video',
      title: 'Emergency First Aid Basics',
      duration: '8:33',
      thumbnail: 'https://img.youtube.com/vi/C_QAI2lg5g0/maxresdefault.jpg',
      youtubeId: 'C_QAI2lg5g0', // First aid basics
      description: 'Essential first aid techniques everyone should know'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('education')}</h1>
          <p className="text-muted-foreground mt-2">
            Learn about health, hygiene, and disease prevention
          </p>
        </div>

        {/* Education Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {educationTopics.map((topic, index) => {
            const Icon = topic.icon;
            const colors = colorClasses[topic.color as keyof typeof colorClasses];
            
            return (
              <Card key={index} className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <CardTitle>{topic.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {topic.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 ${colors.bg}`}></div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Video Resources */}
        <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              <CardTitle>Educational Videos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <div key={index} className="group cursor-pointer">
                  <div 
                    className="relative overflow-hidden rounded-lg mb-3"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${resource.youtubeId}`, '_blank')}
                  >
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center group-hover:bg-rose-600 transition-colors shadow-lg">
                        <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-white border-b-6 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                      {resource.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-rose-500 px-2 py-1 rounded text-xs text-white font-medium">
                      YouTube
                    </div>
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="backdrop-blur-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-[var(--border-soft)]">
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-1">Health Helpline</p>
                <p className="text-2xl font-bold">104</p>
              </div>
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-1">Ambulance</p>
                <p className="text-2xl font-bold">108</p>
              </div>
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-1">Water Quality Issues</p>
                <p className="text-2xl font-bold">1800-XXX-XXXX</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}