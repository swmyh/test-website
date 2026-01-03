const skills = [
  {
    name: 'Web UI / Frontend',
    level: 86,
    description: '情報設計と表現の両面から、使いやすいUIを構築。',
    tags: ['HTML', 'CSS', 'JavaScript']
  },
  {
    name: 'Embedded Systems',
    level: 80,
    description: 'マイコン制御や通信を活用したデバイス開発。',
    tags: ['C/C++', 'I2C', 'SPI']
  },
  {
    name: 'Game Development',
    level: 75,
    description: '体験設計とインタラクションの最適化。',
    tags: ['Unity', 'Physics', 'UX']
  },
  {
    name: 'Data Design',
    level: 72,
    description: 'データ設計と運用の基盤を整える。',
    tags: ['SQL', 'Supabase', 'Architecture']
  },
  {
    name: 'Git / Collaboration',
    level: 78,
    description: 'チーム開発における基盤整備と運用。',
    tags: ['Git', 'GitHub', 'Workflow']
  },
  {
    name: 'English Communication',
    level: 66,
    description: '技術情報の収集と発信に活用。',
    tags: ['Reading', 'Writing', 'Docs']
  }
]

const timeline = [
  {
    date: '2025年4月',
    title: '大学入学',
    description: '理工系学部にて情報・電気電子を専攻開始'
  },
  {
    date: '2024年',
    title: 'ゲーム開発開始',
    description: 'チームでのゲーム制作プロジェクトに参加'
  },
  {
    date: '2023年',
    title: 'マイコン制御学習',
    description: 'LCD制御(I2C/SPI)などの組み込み開発を学習'
  },
  {
    date: '2022年',
    title: 'デザイン思考の探究',
    description: 'UI/UXや情報設計の基礎を体系的に学習'
  }
]

const skillsContainer = document.getElementById('skills-detail')

if (skillsContainer) {
  skillsContainer.innerHTML = skills.map((skill, index) => `
    <div class="skill-card" data-reveal style="--delay: ${index * 0.08}s; --level: ${skill.level}%;">
      <div class="skill-card__header">
        <span>${skill.name}</span>
        <span>${skill.level}%</span>
      </div>
      <p class="skill-card__desc">${skill.description}</p>
      <div class="card__meta">
        ${skill.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="skill-bar">
        <div class="skill-bar__fill"></div>
      </div>
    </div>
  `).join('')
}

const timelineContainer = document.getElementById('timeline')

if (timelineContainer) {
  timelineContainer.innerHTML = timeline.map((item, index) => `
    <div class="timeline-item" data-reveal style="--delay: ${index * 0.08}s;">
      <div class="timeline-marker"></div>
      <div class="timeline-date">${item.date}</div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-desc">${item.description}</div>
    </div>
  `).join('')
}
