import { Faculty, Student } from '../types/people';

// Faculty members
export const facultyMembers: Faculty[] = [
  {
    id: 'f1',
    type: 'faculty',
    name: 'Yan Liu',
    title: 'Professor',
    position: 'Director of Machine Learning Center',
    department: 'Computer Science',
    image: '/images/faculty/yan_liu.jpg',
    email: 'liu32@usc.edu',
    website: 'https://sites.google.com/view/yanliu-ai/home',
    researchAreas: ['Machine Learning', 'Artificial Intelligence']
  },
  {
    id: 'f2',
    type: 'faculty',
    name: 'Dani Yogatama',
    title: 'Associate Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/yogatama_dani.jpg',
    email: 'yogatama@usc.edu',
    website: 'https://dyogatama.github.io/',
    researchAreas: ['Deep Learning', 'NLP']
  },
  {
    id: 'f3',
    type: 'faculty',
    name: 'Robin Jia',
    title: 'Assistant Professor',
    position: 'Allegro Lab Lead',
    department: 'Computer Science',
    image: '/images/faculty/robin_jia.png',
    email: 'sjohnson@usc.edu',
    website: 'https://robinjia.github.io/',
    researchAreas: ['Deep Learning, NLP']
  },
  {
    id: 'f4',
    type: 'faculty',
    name: 'Aram Galstyan',
    title: 'Associate Professor',
    position: 'Department Chair',
    department: 'Computer Science',
    image: '/images/faculty/aram.png',
    email: 'galstyan@isi.edu',
    website: 'https://www.isi.edu/people-galstyan/',
    researchAreas: ['Information Theory', 'Machine Learning']
  },
  {
    id: 'f5',
    type: 'faculty',
    name: 'Vatsal Sharan',
    title: 'Assistant Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/vatsal.jpg', 
    email: 'vsharan@usc.edu',
    website: 'https://vatsalsharan.github.io/',
    researchAreas: ['Computer Vision', 'Deep Learning']
  },
  {
    id: 'f6',
    type: 'faculty',
    name: 'Jessie Thompson',
    title: 'Assistant Professor',
    position: 'AI Research Lead',
    department: 'Computer Science',
    image: '/images/faculty/jessie_thompson.jpeg', 
    email: 'jessetho@usc.edu',
    website: 'https://jessethomason.com/',
    researchAreas: ['Natural Language Processing', 'Robotics']
  },
  {
    id: 'f7',
    type: 'faculty',
    name: 'Sean (Xiang) Ren',
    title: 'Associate Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/xiang_ren.png', 
    email: 'xiangren@usc.edu',
    researchAreas: ['AI Systems', 'NLP']
  },
  {
    id: 'f8',
    type: 'faculty',
    name: 'Haipeng Luo',
    title: 'Associate Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/haipeng_luo.png', 
    email: 'haipengl@usc.edu',
    website: 'https://haipeng-luo.net/',
    researchAreas: ['Machine Learning', 'Reinforcement Learning']
  },
  {
    id: 'f9',
    type: 'faculty',
    name: 'Swabha Swayamdipta',
    title: 'Assistant Professor',
    position: 'Associate Director of CAIS',
    department: 'Computer Science',
    image: '/images/faculty/swabha.jpeg', 
    email: 'swabhas@usc.edu',
    website: 'https://swabhs.com/',
    researchAreas: ['Natural Language Processing', 'Machine Learning']
  },
  {
  id: 'f10',
    type: 'faculty',
    name: 'Jinchi Lv',
    title: 'Professor',
    position: 'Department Chair',
    department: 'Data Sciences and Operations',
    image: '/images/faculty/jinchi.jpg',
    email: 'jinchilv@marshall.usc.edu',
    website: 'http://faculty.marshall.usc.edu/jinchi-lv',
    researchAreas: ['Machine Learning', 'Artificial Intelligence']
  },
  {
    id: 'f11',
    type: 'faculty',
    name: 'Stanislav Minsker',
    title: 'Professor',
    position: '',
    department: 'Mathematics',
    image: '/images/faculty/stanislav.png',
    email: 'minsker@usc.edu',
    website: 'https://stasminsker.github.io/',
    researchAreas: ['Statistical learning theory']
  },
  {
    id: 'f12',
    type: 'faculty',
    name: 'Meisan Razaviyayn',
    title: 'Associate Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/meisan.jpg',
    email: 'razaviya@usc.edu',
    website: 'https://sites.usc.edu/razaviyayn/',
    researchAreas: ['Deep Learning, NLP']
  },
  {
    id: 'f13',
    type: 'faculty',
    name: 'Rahul Jain',
    title: 'Professor',
    position: 'Director of Center for AAI',
    department: 'Computer Science',
    image: '/images/faculty/rahul_jain.png',
    email: 'rahul.jain@usc.edu',
    website: 'https://www.rahuljain.net/',
    researchAreas: ['Artificial Intelligence', 'Machine Learning']
  },
  {
    id: 'f14',
    type: 'faculty',
    name: 'Yingying Fan',
    title: 'Professor',
    position: 'Associate Dean for PhD Program',
    department: 'Data Sciences and Operations',
    image: '/images/faculty/yingying.jpg', 
    email: 'fanyingy@usc.edu',
    website: 'https://faculty.marshall.usc.edu/yingying-fan/',
    researchAreas: ['Information Theory', 'Statistics']
  },
  {
    id: 'f15',
    type: 'faculty',
    name: 'Mahdi Soltanolkotabi',
    title: 'Assistant Professor',
    position: 'AI Research Lead',
    department: 'Computer Science',
    image: '/images/faculty/mahdi.jpg', 
    email: 'soltanol@usc.edu',
    website: 'https://viterbi.usc.edu/directory/faculty/Soltanolkotabi/Mahdi',
    researchAreas: ['Aritificial Intelligence', 'Theory of Algorithms']
  },
  {
    id: 'f16',
    type: 'faculty',
    name: 'Yue Zhao',
    title: 'Assistant Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/yue_zhao.jpg', 
    email: 'yzhao010@usc.edu',
    researchAreas: ['AI Systems', 'Machine Learning']
  },
  {
    id: 'f17',
    type: 'faculty',
    name: 'Willie Neiswanger',
    title: 'Assistant Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/willie.jpg', 
    email: 'neiswang@usc.edu',
    website: 'https://willieneis.github.io/',
    researchAreas: ['Machine Learning', 'Decision Making']
  },
  {
    id: 'f18',
    type: 'faculty',
    name: 'Ruishan Liu',
    title: 'Assistant Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/ruishan.jpg', 
    email: 'ruishanl@usc.edu',
    website: 'https://viterbi-web.usc.edu/~ruishanl/',
    researchAreas: ['Genomics', 'Machine Learning']
  },
  {
    id: 'f19',
    type: 'faculty',
    name: 'Haipeng Luo',
    title: 'Associate Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/haipeng_luo.jpg', 
    email: 'haipengl@usc.edu',
    website: 'https://haipeng-luo.net/',
    researchAreas: ['Artificial Intelligence', 'Machine Learning']
  },
  {
    id: 'f20',
    type: 'faculty',
    name: 'Jieyu Zhao',
    title: 'Assistant Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/jieyu_zhao.jpg', 
    email: 'jieyuz@usc.edu',
    website: 'https://jyzhao.net/',
    researchAreas: ['Natural Language Processing', 'Robotics']
  },
  {
    id: 'f21',
    type: 'faculty',
    name: 'Shang-Hua Teng',
    title: 'Professor',
    position: '',
    department: 'Computer Science',
    image: '/images/faculty/shang-hua.jpg', 
    email: 'shanghua@usc.edu',
    website: 'https://viterbi.usc.edu/directory/faculty/Teng/Shanghua',
    researchAreas: ['Game Theory', 'Mathematical Programming']
  }
];

export const students: Student[] = [
  // Postdocs & PhD Students
  {
    id: 's1',
    type: 'student',
    name: 'Zijun Cui',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'zcui@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's2',
    type: 'student',
    name: 'Chuizheng Meng',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'cmeng@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's3',
    type: 'student',
    name: 'Yizhou Zhang',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'yizhouz@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's4',
    type: 'student',
    name: 'Loc Trinh',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'ltrinh@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's5',
    type: 'student',
    name: 'James Enouen',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'jenouen@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's6',
    type: 'student',
    name: 'Sam Griesemer',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'sgriesem@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's7',
    type: 'student',
    name: 'Defu Cao',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'dcao@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's8',
    type: 'student',
    name: 'Emily Nguyen',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'emnguyen@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's9',
    type: 'student',
    name: 'Wen Ye',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'wye@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's10',
    type: 'student',
    name: 'Sajjad Shahabi',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'sshahabi@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's11',
    type: 'student',
    name: 'Jie Cai',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'jiecai@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's12',
    type: 'student',
    name: 'Wei Yang',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Yan Liu',
    graduationYear: 2025,
    image: '',
    email: 'weiyang@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's13',
    type: 'student',
    name: 'Taiwei Shi',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Jieyu Zhao',
    graduationYear: 2025,
    image: '',
    email: 'tshi@usc.edu',
    interests: ['NLP']
  },
  {
    id: 's14',
    type: 'student',
    name: 'Ziyi Liu',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Jieyu Zhao',
    graduationYear: 2025,
    image: '',
    email: 'ziyiliu@usc.edu',
    interests: ['NLP']
  },
  {
    id: 's15',
    type: 'student',
    name: 'Yubo Zhang',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Jieyu Zhao',
    graduationYear: 2025,
    image: '',
    email: 'yubozhan@usc.edu',
    interests: ['NLP']
  },
  {
    id: 's16',
    type: 'student',
    name: 'Johnny Wei',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Robin Jia',
    graduationYear: 2025,
    image: '',
    email: 'jwei@usc.edu',
    interests: ['NLP']
  },
  {
    id: 's17',
    type: 'student',
    name: 'Ameya Godbole',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Robin Jia',
    graduationYear: 2025,
    image: '',
    email: 'agodbole@usc.edu',
    interests: ['NLP']
  },
  {
    id: 's18',
    type: 'student',
    name: 'Wang (Bill) Zhu',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Robin Jia, Jesse Thomason',
    graduationYear: 2025,
    image: '',
    email: 'wangzhu@usc.edu',
    interests: ['NLP', 'Vision+Language']
  },
  {
    id: 's19',
    type: 'student',
    name: 'Ting-Yun (Charlotte) Chang',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Robin Jia, Jesse Thomason',
    graduationYear: 2025,
    image: '',
    email: 'tychang@usc.edu',
    interests: ['NLP']
  },
  {
    id: 's20',
    type: 'student',
    name: 'Deqing Fu',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Robin Jia, Vatsal Sharan',
    graduationYear: 2025,
    image: '',
    email: 'deqingfu@usc.edu',
    interests: ['NLP', 'ML theory']
  },
  {
    id: 's21',
    type: 'student',
    name: 'Mengxiao Zhang',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Haipeng Luo',
    graduationYear: 2025,
    image: '',
    email: 'mengxiao@usc.edu',
    interests: ['Bandits and RL']
  },
  {
    id: 's22',
    type: 'student',
    name: 'Chung-Wei Lee',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Haipeng Luo',
    graduationYear: 2025,
    image: '',
    email: 'clee@usc.edu',
    interests: ['Learning in games']
  },
  {
    id: 's23',
    type: 'student',
    name: 'Tiancheng Jin',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Haipeng Luo',
    graduationYear: 2025,
    image: '',
    email: 'tjin@usc.edu',
    interests: ['RL']
  },
  {
    id: 's24',
    type: 'student',
    name: 'Spandan Senapati',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Haipeng Luo, Vatsal Sharan',
    graduationYear: 2025,
    image: '',
    email: 'ssenapati@usc.edu',
    interests: ['ML theory']
  },
  {
    id: 's25',
    type: 'student',
    name: 'Soumita Hait',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Haipeng Luo',
    graduationYear: 2025,
    image: '',
    email: 'shait@usc.edu',
    interests: ['ML theory']
  },
  {
    id: 's26',
    type: 'student',
    name: 'Yue Wu',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Haipeng Luo',
    graduationYear: 2025,
    image: '',
    email: 'yuewu@usc.edu',
    interests: ['ML theory']
  },
  {
    id: 's27',
    type: 'student',
    name: 'Joshua Robinson',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Dani Yogatama',
    graduationYear: 2025,
    image: '',
    email: 'jrobinson@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's28',
    type: 'student',
    name: 'Ting-Rui Chiang',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Dani Yogatama',
    graduationYear: 2025,
    image: '',
    email: 'trchiang@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's29',
    type: 'student',
    name: 'Ollie Liu',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Dani Yogatama, Willie Neiswanger',
    graduationYear: 2025,
    image: '',
    email: 'ollieliu@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's30',
    type: 'student',
    name: 'Isabelle Lee',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Dani Yogatama',
    graduationYear: 2025,
    image: '',
    email: 'isabellee@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's31',
    type: 'student',
    name: 'Velocity Yu',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Dani Yogatama',
    graduationYear: 2025,
    image: '',
    email: 'velocityu@usc.edu',
    interests: ['AI/ML']
  },
  {
    id: 's32',
    type: 'student',
    name: 'Siddartha Devic',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Vatsal Sharan',
    graduationYear: 2025,
    image: '',
    email: 'sdevic@usc.edu',
    interests: ['Fairness', 'ML Theory']
  },
  {
    id: 's33',
    type: 'student',
    name: 'Bhavya Vasudeva',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Vatsal Sharan',
    graduationYear: 2025,
    image: '',
    email: 'bvasudeva@usc.edu',
    interests: ['ML Theory']
  },
  {
    id: 's34',
    type: 'student',
    name: 'Julian Asilis',
    title: 'PhD Student',
    program: 'PhD',
    advisor: 'Vatsal Sharan',
    graduationYear: 2025,
    image: '',
    email: 'jasilis@usc.edu',
    interests: ['ML Theory']
  }
];

// Helper functions for managing people data
export const addPerson = (person: Faculty | Student) => {
  if (person.type === 'faculty') {
    facultyMembers.push(person);
  } else {
    students.push(person);
  }
};

export const removePerson = (id: string) => {
  const facultyIndex = facultyMembers.findIndex(f => f.id === id);
  if (facultyIndex !== -1) {
    facultyMembers.splice(facultyIndex, 1);
    return;
  }

  const studentIndex = students.findIndex(s => s.id === id);
  if (studentIndex !== -1) {
    students.splice(studentIndex, 1);
  }
};

export const updatePerson = (person: Faculty | Student) => {
  if (person.type === 'faculty') {
    const index = facultyMembers.findIndex(f => f.id === person.id);
    if (index !== -1) {
      facultyMembers[index] = person;
    }
  } else {
    const index = students.findIndex(s => s.id === person.id);
    if (index !== -1) {
      students[index] = person;
    }
  }
}; 