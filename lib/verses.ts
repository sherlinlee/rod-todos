export type BibleVerse = {
  reference: string;
  text: string;
};

const VERSES: BibleVerse[] = [
  {
    reference: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
  },
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  },
  {
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd, I lack nothing.",
  },
  {
    reference: "Isaiah 41:10",
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
  {
    reference: "Lamentations 3:22-23",
    text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
  },
  {
    reference: "Psalm 139:14",
    text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
  },
  {
    reference: "2 Timothy 1:7",
    text: "For God has not given us a spirit of fear, but of power, of love and of a sound mind.",
  },
  {
    reference: "Psalm 37:4",
    text: "Take delight in the Lord, and he will give you the desires of your heart.",
  },
  {
    reference: "Micah 6:8",
    text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.",
  },
  {
    reference: "John 14:27",
    text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
  },
  {
    reference: "Psalm 34:18",
    text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
  },
  {
    reference: "Romans 15:13",
    text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.",
  },
  {
    reference: "Psalm 27:1",
    text: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?",
  },
  {
    reference: "Galatians 6:9",
    text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
  },
  {
    reference: "Psalm 55:22",
    text: "Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
  },
  {
    reference: "1 Peter 5:7",
    text: "Cast all your anxiety on him because he cares for you.",
  },
  {
    reference: "Psalm 16:11",
    text: "You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand.",
  },
  {
    reference: "Colossians 3:15",
    text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.",
  },
  {
    reference: "Psalm 118:24",
    text: "This is the day the Lord has made; let us rejoice and be glad in it.",
  },
  {
    reference: "Hebrews 13:5",
    text: "Keep your lives free from the love of money and be content with what you have, because God has said, 'Never will I leave you; never will I forsake you.'",
  },
  {
    reference: "Psalm 91:1-2",
    text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, 'He is my refuge and my fortress, my God, in whom I trust.'",
  },
  {
    reference: "Ephesians 3:20",
    text: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us.",
  },
  {
    reference: "Psalm 62:1-2",
    text: "Truly my soul finds rest in God; my salvation comes from him. Truly he is my rock and my salvation; he is my fortress, I will never be shaken.",
  },
  {
    reference: "James 1:5",
    text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
  },
  {
    reference: "Psalm 103:12",
    text: "As far as the east is from the west, so far has he removed our transgressions from us.",
  },
  {
    reference: "Zephaniah 3:17",
    text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
  },
  {
    reference: "Psalm 121:1-2",
    text: "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.",
  },
  {
    reference: "Romans 12:12",
    text: "Be joyful in hope, patient in affliction, faithful in prayer.",
  },
  {
    reference: "Psalm 30:5",
    text: "For his anger lasts only a moment, but his favor lasts a lifetime; weeping may stay for the night, but rejoicing comes in the morning.",
  },
  {
    reference: "Deuteronomy 31:8",
    text: "The Lord himself goes before you and will be with you; he will never leave you nor forsake you. Do not be afraid; do not be discouraged.",
  },
  {
    reference: "Psalm 19:14",
    text: "May these words of my mouth and this meditation of my heart be pleasing in your sight, Lord, my Rock and my Redeemer.",
  },
  {
    reference: "2 Corinthians 12:9",
    text: "My grace is sufficient for you, for my power is made perfect in weakness.",
  },
  {
    reference: "Psalm 42:11",
    text: "Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.",
  },
  {
    reference: "Nahum 1:7",
    text: "The Lord is good, a refuge in times of trouble. He cares for those who trust in him.",
  },
];

function dateSeed(iso: string): number {
  let seed = 0;
  for (const ch of iso) {
    seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return seed;
}

export function verseForDate(date: string): BibleVerse {
  return VERSES[dateSeed(date) % VERSES.length];
}

export function formatJournalDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
