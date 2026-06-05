// === DATA STORAGE ===
const STORAGE_KEY = 'mydict_data';
const THEME_KEY = 'mydict_theme';

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return { groups: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();

// === THEME / DARK MODE ===
function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('btn-theme').textContent = '☀️';
    } else {
        document.body.classList.remove('dark');
        document.getElementById('btn-theme').textContent = '🌙';
    }
}

function toggleTheme() {
    const current = document.body.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
}

document.getElementById('btn-theme').addEventListener('click', toggleTheme);
applyTheme(loadTheme());

// === NAVIGATION ===
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
    
    // Show/hide bottom nav for secondary screens
    const bottomNav = document.getElementById('bottom-nav');
    if (screenId === 'screen-search' || screenId === 'screen-groups') {
        bottomNav.style.display = 'flex';
    } else {
        bottomNav.style.display = 'none';
    }
    
    if (screenId === 'screen-groups') renderGroups();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

// === EMOJI DICTIONARY ===
const WORD_EMOJIS = {
    'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'grape': '🍇', 'strawberry': '🍓',
    'cherry': '🍒', 'peach': '🍑', 'pear': '🍐', 'lemon': '🍋', 'watermelon': '🍉',
    'pineapple': '🍍', 'coconut': '🥥', 'avocado': '🥑', 'eggplant': '🍆', 'potato': '🥔',
    'carrot': '🥕', 'corn': '🌽', 'broccoli': '🥦', 'cucumber': '🥒', 'mushroom': '🍄',
    'onion': '🧅', 'garlic': '🧄', 'bread': '🍞', 'baguette': '🥖', 'croissant': '🥐',
    'pizza': '🍕', 'burger': '🍔', 'fries': '🍟', 'hotdog': '🌭', 'sandwich': '🥪',
    'taco': '🌮', 'burrito': '🌯', 'sushi': '🍣', 'rice': '🍚', 'pasta': '🍝',
    'spaghetti': '🍝', 'noodles': '🍜', 'soup': '🍲', 'stew': '🍲', 'salad': '🥗',
    'egg': '🥚', 'bacon': '🥓', 'steak': '🥩', 'chicken': '🍗', 'fish': '🐟',
    'shrimp': '🦐', 'lobster': '🦞', 'crab': '🦀', 'oyster': '🦪', 'snail': '🐌',
    'coffee': '☕', 'tea': '🍵', 'wine': '🍷', 'beer': '🍺', 'cocktail': '🍸',
    'juice': '🧃', 'milk': '🥛', 'water': '💧', 'ice': '🧊', 'cake': '🎂',
    'cookie': '🍪', 'donut': '🍩', 'chocolate': '🍫', 'candy': '🍬', 'lollipop': '🍭',
    'honey': '🍯', 'cat': '🐱', 'dog': '🐶', 'puppy': '🐶', 'wolf': '🐺',
    'fox': '🦊', 'bear': '🐻', 'panda': '🐼', 'koala': '🐨', 'tiger': '🐯',
    'lion': '🦁', 'horse': '🐴', 'pony': '🐴', 'zebra': '🦓', 'deer': '🦌',
    'giraffe': '🦒', 'elephant': '🐘', 'rhino': '🦏', 'hippo': '🦛', 'monkey': '🐵',
    'gorilla': '🦍', 'orangutan': '🦧', 'mouse': '🐭', 'rat': '🐀', 'hamster': '🐹',
    'rabbit': '🐰', 'bunny': '🐰', 'hedgehog': '🦔', 'bat': '🦇', 'bear': '🐻',
    'pig': '🐷', 'boar': '🐗', 'cow': '🐮', 'ox': '🐂', 'buffalo': '🐃',
    'bison': '🦬', 'sheep': '🐑', 'ram': '🐏', 'goat': '🐐', 'camel': '🐪',
    'llama': '🦙', 'giraffe': '🦒', 'kangaroo': '🦘', 'badger': '🦡', 'beaver': '🦫',
    'otter': '🦦', 'sloth': '🦥', 'bird': '🐦', 'chicken': '🐔', 'rooster': '🐓',
    'turkey': '🦃', 'duck': '🦆', 'swan': '🦢', 'goose': '🪿', 'peacock': '🦚',
    'parrot': '🦜', 'flamingo': '🦩', 'dove': '🕊️', 'eagle': '🦅', 'hawk': '🦅',
    'owl': '🦉', 'crow': '🐦‍⬛', 'penguin': '🐧', 'seagull': '🐦', 'sparrow': '🐦',
    'butterfly': '🦋', 'bee': '🐝', 'ant': '🐜', 'ladybug': '🐞', 'cricket': '🦗',
    'spider': '🕷️', 'scorpion': '🦂', 'snail': '🐌', 'snake': '🐍', 'lizard': '🦎',
    'turtle': '🐢', 'crocodile': '🐊', 'alligator': '🐊', 'dinosaur': '🦖', 'dragon': '🐉',
    'whale': '🐋', 'dolphin': '🐬', 'shark': '🦈', 'octopus': '🐙', 'squid': '🦑',
    'jellyfish': '🪼', 'seal': '🦭', 'shell': '🐚', 'coral': '🪸', 'crab': '🦀',
    'tree': '🌳', 'pine': '🌲', 'palm': '🌴', 'cactus': '🌵', 'flower': '🌸',
    'rose': '🌹', 'tulip': '🌷', 'sunflower': '🌻', 'hibiscus': '🌺', 'blossom': '🌼',
    'maple': '🍁', 'leaf': '🍃', 'herb': '🌿', 'shamrock': '☘️', 'clover': '🍀',
    'mushroom': '🍄', 'chestnut': '🌰', 'seed': '🌱', 'sprout': '🌱', 'evergreen': '🌲',
    'sun': '☀️', 'moon': '🌙', 'star': '⭐', 'cloud': '☁️', 'rain': '🌧️',
    'snow': '❄️', 'thunder': '⛈️', 'lightning': '⚡', 'tornado': '🌪️', 'fog': '🌫️',
    'wind': '💨', 'rainbow': '🌈', 'fire': '🔥', 'sunrise': '🌅', 'sunset': '🌇',
    'mountain': '⛰️', 'volcano': '🌋', 'desert': '🏜️', 'beach': '🏖️', 'island': '🏝️',
    'forest': '🌲', 'park': '🏞️', 'camping': '🏕️', 'tent': '⛺', 'house': '🏠',
    'home': '🏠', 'building': '🏢', 'office': '🏢', 'hotel': '🏨', 'hospital': '🏥',
    'school': '🏫', 'university': '🎓', 'bank': '🏦', 'store': '🏪', 'shop': '🛍️',
    'factory': '🏭', 'castle': '🏰', 'church': '⛪', 'temple': '🛕', 'mosque': '🕌',
    'synagogue': '🕍', 'bridge': '🌉', 'tower': '🗼', 'statue': '🗽', 'fountain': '⛲',
    'car': '🚗', 'automobile': '🚗', 'taxi': '🚕', 'bus': '🚌', 'train': '🚆',
    'subway': '🚇', 'tram': '🚊', 'ship': '🚢', 'boat': '⛵', 'sailboat': '⛵',
    'canoe': '🛶', 'kayak': '🛶', 'speedboat': '🚤', 'cruise': '🛳️', 'ferry': '⛴️',
    'airplane': '✈️', 'helicopter': '🚁', 'rocket': '🚀', 'satellite': '🛰️', 'ufo': '🛸',
    'bike': '🚲', 'bicycle': '🚲', 'motorcycle': '🏍️', 'scooter': '🛵', 'bus': '🚌',
    'truck': '🚚', 'van': '🚐', 'ambulance': '🚑', 'firetruck': '🚒', 'police': '🚓',
    'taxi': '🚕', 'tractor': '🚜', 'bulldozer': '🚜', 'crane': '🏗️', 'forklift': '🚜',
    'bed': '🛏️', 'chair': '🪑', 'sofa': '🛋️', 'table': '🍽️', 'desk': '🖥️',
    'lamp': '💡', 'candle': '🕯️', 'clock': '⏰', 'watch': '⌚', 'hourglass': '⏳',
    'phone': '📱', 'telephone': '☎️', 'computer': '💻', 'laptop': '💻', 'keyboard': '⌨️',
    'mouse': '🖱️', 'printer': '🖨️', 'camera': '📷', 'video': '📹', 'tv': '📺',
    'radio': '📻', 'microphone': '🎤', 'headphones': '🎧', 'speaker': '🔊', 'battery': '🔋',
    'plug': '🔌', 'bulb': '💡', 'flashlight': '🔦', 'book': '📖', 'notebook': '📓',
    'paper': '📄', 'newspaper': '📰', 'magazine': '📰', 'letter': '✉️', 'envelope': '✉️',
    'pencil': '✏️', 'pen': '🖊️', 'marker': '🖍️', 'crayon': '🖍️', 'paintbrush': '🖌️',
    'palette': '🎨', 'canvas': '🎨', 'scissors': '✂️', 'knife': '🔪', 'hammer': '🔨',
    'wrench': '🔧', 'screwdriver': '🪛', 'gear': '⚙️', 'chain': '⛓️', 'lock': '🔒',
    'key': '🔑', 'map': '🗺️', 'compass': '🧭', 'globe': '🌍', 'world': '🌍',
    'flag': '🚩', 'banner': '🎌', 'balloon': '🎈', 'party': '🎉', 'gift': '🎁',
    'trophy': '🏆', 'medal': '🏅', 'crown': '👑', 'gem': '💎', 'ring': '💍',
    'necklace': '📿', 'bracelet': '💎', 'earrings': '💎', 'watch': '⌚', 'glasses': '👓',
    'sunglasses': '🕶️', 'hat': '🎩', 'cap': '🧢', 'scarf': '🧣', 'gloves': '🧤',
    'coat': '🧥', 'jacket': '🧥', 'shirt': '👕', 'tshirt': '👕', 'jeans': '👖',
    'pants': '👖', 'shorts': '🩳', 'skirt': '👗', 'dress': '👗', 'suit': '🕴️',
    'kimono': '👘', 'sari': '🥻', 'swimsuit': '👙', 'bikini': '👙', 'lingerie': '👙',
    'shoes': '👟', 'sneakers': '👟', 'boots': '🥾', 'sandals': '👡', 'heels': '👠',
    'slippers': '🩴', 'socks': '🧦', 'backpack': '🎒', 'bag': '👜', 'purse': '👛',
    'wallet': '👛', 'umbrella': '☂️', 'cane': '🦯', 'crutch': '🩼', 'bandage': '🩹',
    'syringe': '💉', 'pill': '💊', 'medicine': '💊', 'thermometer': '🌡️', 'stethoscope': '🩺',
    'toothbrush': '🪥', 'toothpaste': '🦷', 'soap': '🧼', 'shampoo': '🧴', 'lotion': '🧴',
    'comb': '🪮', 'mirror': '🪞', 'razor': '🪒', 'scissors': '✂️', 'tweezers': '✂️',
    'broom': '🧹', 'mop': '🪣', 'bucket': '🪣', 'sponge': '🧽', 'toilet': '🚽',
    'shower': '🚿', 'bathtub': '🛁', 'towel': '🧻', 'tissue': '🧻', 'trash': '🗑️',
    'recycling': '♻️', 'broom': '🧹', 'basket': '🧺', 'ball': '⚽', 'soccer': '⚽',
    'football': '🏈', 'basketball': '🏀', 'baseball': '⚾', 'tennis': '🎾', 'volleyball': '🏐',
    'rugby': '🏉', 'cricket': '🏏', 'hockey': '🏒', 'golf': '⛳', 'bowling': '🎳',
    'boxing': '🥊', 'martial': '🥋', 'karate': '🥋', 'gymnastics': '🤸', 'dance': '💃',
    'music': '🎵', 'guitar': '🎸', 'piano': '🎹', 'violin': '🎻', 'trumpet': '🎺',
    'saxophone': '🎷', 'flute': '🪈', 'drum': '🥁', 'microphone': '🎤', 'headphones': '🎧',
    'sax': '🎷', 'harp': '🎶', 'accordion': '🪗', 'banjo': '🪕', 'maracas': '🪇',
    'money': '💰', 'dollar': '💵', 'euro': '💶', 'pound': '💷', 'yen': '💴',
    'credit': '💳', 'receipt': '🧾', 'chart': '📈', 'graph': '📉', 'trend': '📊',
    'briefcase': '💼', 'mailbox': '📬', 'package': '📦', 'label': '🏷️', 'shopping': '🛒',
    'cart': '🛒', 'basket': '🧺', 'moneybag': '💰', 'coin': '🪙', 'gem': '💎',
    'crown': '👑', 'scepter': '👑', 'king': '🤴', 'queen': '👸', 'prince': '🤴',
    'princess': '👸', 'superhero': '🦸', 'villain': '🦹', 'ninja': '🥷', 'magician': '🧙',
    'fairy': '🧚', 'mermaid': '🧜', 'elf': '🧝', 'vampire': '🧛', 'zombie': '🧟',
    'ghost': '👻', 'alien': '👽', 'robot': '🤖', 'clown': '🤡', 'baby': '👶',
    'child': '🧒', 'boy': '👦', 'girl': '👧', 'man': '👨', 'woman': '👩',
    'person': '🧑', 'adult': '🧑', 'elder': '🧓', 'grandma': '👵', 'grandpa': '👴',
    'family': '👨‍👩‍👧‍👦', 'couple': '💑', 'kiss': '💋', 'heart': '❤️', 'love': '❤️',
    'broken': '💔', 'anger': '💢', 'explosion': '💥', 'fire': '🔥', 'sparkle': '✨',
    'star': '⭐', 'zap': '⚡', 'snowflake': '❄️', 'droplet': '💧', 'bubble': '🫧',
    'tornado': '🌪️', 'fog': '🌫️', 'drought': '🏜️', 'earthquake': '🫨', 'tsunami': '🌊',
    'volcano': '🌋', 'flood': '🌊', 'storm': '⛈️', 'hurricane': '🌀', 'comet': '☄️',
    'planet': '🪐', 'galaxy': '🌌', 'universe': '🌌', 'space': '🚀', 'astronaut': '👨‍🚀',
    'alien': '👽', 'ufo': '🛸', 'rocket': '🚀', 'satellite': '🛰️', 'telescope': '🔭',
    'microscope': '🔬', 'dna': '🧬', 'atom': '⚛️', 'radioactive': '☢️', 'biohazard': '☣️',
    'warning': '⚠️', 'stop': '🛑', 'prohibited': '🚫', 'no_entry': '⛔', 'forbidden': '🚭',
    'danger': '☠️', 'skull': '💀', 'bone': '🦴', 'tooth': '🦷', 'eye': '👁️',
    'tongue': '👅', 'ear': '👂', 'nose': '👃', 'mouth': '👄', 'brain': '🧠',
    'heart': '🫀', 'lungs': '🫁', 'stomach': '🤰', 'leg': '🦵', 'foot': '🦶',
    'arm': '💪', 'muscle': '💪', 'bone': '🦴', 'blood': '🩸', 'bandage': '🩹',
    'crutch': '🩼', 'wheelchair': '♿', 'cane': '🦯', 'hearing': '🦻', 'glasses': '👓',
    'mask': '😷', 'thermometer': '🌡️', 'pill': '💊', 'syringe': '💉', 'stethoscope': '🩺',
    'ambulance': '🚑', 'hospital': '🏥', 'doctor': '👨‍⚕️', 'nurse': '👩‍⚕️', 'dentist': '🦷',
    'pharmacy': '💊', 'medicine': '💊', 'health': '❤️‍🩹', 'fitness': '🏋️', 'yoga': '🧘',
    'running': '🏃', 'walking': '🚶', 'hiking': '🥾', 'cycling': '🚴', 'swimming': '🏊',
    'surfing': '🏄', 'skiing': '⛷️', 'snowboarding': '🏂', 'skating': '⛸️', 'fishing': '🎣',
    'hunting': '🏹', 'archery': '🏹', 'shooting': '🔫', 'boxing': '🥊', 'wrestling': '🤼',
    'fencing': '🤺', 'gymnastics': '🤸', 'weightlifting': '🏋️', 'meditation': '🧘', 'dance': '💃',
    'ballet': '🩰', 'theater': '🎭', 'opera': '🎭', 'circus': '🎪', 'carnival': '🎡',
    'festival': '🎪', 'party': '🥳', 'birthday': '🎂', 'wedding': '💒', 'funeral': '⚰️',
    'graduation': '🎓', 'celebration': '🎉', 'fireworks': '🎆', 'sparkler': '🎇', 'confetti': '🎊',
    'balloon': '🎈', 'banner': '🎌', 'flags': '🎏', 'ribbon': '🎀', 'trophy': '🏆',
    'medal': '🏅', 'prize': '🏆', 'crown': '👑', 'king': '🤴', 'queen': '👸',
    'prince': '🤴', 'princess': '👸', 'knight': '⚔️', 'shield': '🛡️', 'sword': '⚔️',
    'dagger': '🗡️', 'axe': '🪓', 'bow': '🏹', 'arrow': '🏹', 'target': '🎯',
    'bullseye': '🎯', 'dart': '🎯', 'billiards': '🎱', 'pool': '🎱', 'pingpong': '🏓',
    'badminton': '🏸', 'tennis': '🎾', 'frisbee': '🥏', 'kite': '🪁', 'yo-yo': '🪀',
    'dice': '🎲', 'puzzle': '🧩', 'toy': '🧸', 'teddy': '🧸', 'doll': '🎎',
    'robot': '🤖', 'lego': '🧱', 'blocks': '🧱', 'game': '🎮', 'controller': '🎮',
    'joystick': '🕹️', 'slot': '🎰', 'casino': '🎰', 'poker': '🃏', 'cards': '🃏',
    'chess': '♟️', 'checkers': '⚫', 'dominoes': '🎲', 'mahjong': '🀄', 'darts': '🎯',
    'bowling': '🎳', 'golf': '⛳', 'hole': '⛳', 'flag': '🚩', 'golfball': '⛳',
    'rugby': '🏉', 'cricket': '🏏', 'lacrosse': '🥍', 'field': '🏑', 'hockey': '🏒',
    'puck': '🏒', 'stick': '🏒', 'skis': '🎿', 'snowboard': '🏂', 'sled': '🛷',
    'curling': '🥌', 'ice': '🧊', 'crystal': '🔮', 'ball': '🔮', 'magic': '✨',
    'wand': '🪄', 'hat': '🎩', 'rabbit': '🐇', 'dove': '🕊️', 'pigeon': '🐦',
    'parrot': '🦜', 'peacock': '🦚', 'flamingo': '🦩', 'swan': '🦢', 'duck': '🦆',
    'goose': '🪿', 'turkey': '🦃', 'chicken': '🐔', 'rooster': '🐓', 'bird': '🐦',
    'penguin': '🐧', 'eagle': '🦅', 'hawk': '🦅', 'owl': '🦉', 'bat': '🦇',
    'butterfly': '🦋', 'bug': '🐛', 'ant': '🐜', 'bee': '🐝', 'beetle': '🪲',
    'caterpillar': '🐛', 'cockroach': '🪳', 'cricket': '🦗', 'dragonfly': '🦋', 'firefly': '✨',
    'fly': '🪰', 'grasshopper': '🦗', 'ladybug': '🐞', 'mosquito': '🦟', 'moth': '🦋',
    'scorpion': '🦂', 'snail': '🐌', 'spider': '🕷️', 'tick': '🪳', 'worm': '🪱',
    'centipede': '🐛', 'millipede': '🐛', 'praying': '🙏', 'mantis': '🦗', 'cicada': '🦗',
    'locust': '🦗', 'termite': '🐜', 'flea': '🪰', 'louse': '🪰', 'bedbug': '🪳',
    'stinkbug': '🪳', 'beetle': '🪲', 'weevil': '🪲', 'mantis': '🦗', 'stickbug': '🦗',
    'leafbug': '🦗', 'assassin': '🥷', 'bug': '🐛', 'junebug': '🪲', 'dung': '💩',
    'beetle': '🪲', 'rhino': '🦏', 'beetle': '🪲', 'stag': '🦌', 'beetle': '🪲',
    'hercules': '🦍', 'beetle': '🪲', 'goliath': '🦍', 'beetle': '🪲', 'titan': '🦍',
    'beetle': '🪲', 'jewel': '💎', 'beetle': '🪲', 'tiger': '🐯', 'beetle': '🪲',
    ' scarab': '🪲', 'dung': '💩', 'roller': '🛼', 'dung': '💩', 'beetle': '🪲',
    'tumblebug': '🪲', 'pill': '💊', 'bug': '🐛', 'roly': '⚪', 'poly': '⚪',
    'woodlouse': '🐛', 'sow': '🐷', 'bug': '🐛', 'potato': '🥔', 'bug': '🐛',
    'armadillo': '🐗', 'bug': '🐛', 'giant': '🦍', 'water': '💧', 'bug': '🐛',
    'toe': '🦶', 'biter': '🦟', 'backswimmer': '🏊', 'water': '💧', 'boatman': '🚣',
    'water': '💧', 'strider': '🚶', 'pond': '🏞️', 'skater': '⛸️', 'whirligig': '🌀',
    'beetle': '🪲', 'diving': '🤿', 'beetle': '🪲', 'riffle': '🌊', 'beetle': '🪲',
    'carrion': '⚰️', 'beetle': '🪲', 'burying': '⚰️', 'beetle': '🪲', 'checkered': '✅',
    'beetle': '🪲', 'soldier': '🪖', 'beetle': '🪲', 'bombardier': '💣', 'beetle': '🪲',
    'click': '👆', 'beetle': '🪲', 'firefly': '✨', 'lightning': '⚡', 'bug': '🐛',
    'glow': '✨', 'worm': '🪱', 'candle': '🕯️', 'snake': '🐍', 'fly': '🪰',
    'soldier': '🪖', 'fly': '🪰', 'crane': '🏗️', 'fly': '🪰', 'hover': '🛸',
    'fly': '🪰', 'bee': '🐝', 'fly': '🪰', 'wasp': '🐝', 'hornet': '🐝',
    'yellowjacket': '🐝', 'jacket': '🧥', 'tarantula': '🕷️', 'hawk': '🦅', 'eagle': '🦅',
    'spider': '🕷️', 'wolf': '🐺', 'spider': '🕷️', 'jumping': '🦘', 'spider': '🕷️',
    'orb': '🔮', 'weaver': '🧶', 'spider': '🕷️', 'crab': '🦀', 'spider': '🕷️',
    'cobweb': '🕸️', 'spider': '🕷️', 'black': '⬛', 'widow': '👰', 'spider': '🕷️',
    'brown': '🟫', 'recluse': '🏠', 'spider': '🕷️', 'tarantula': '🕷️', 'wolf': '🐺',
    'spider': '🕷️', 'camel': '🐪', 'spider': '🕷️', 'vinegaroon': '🦂', 'scorpion': '🦂',
    'pseudoscorpion': '🦂', 'wind': '💨', 'scorpion': '🦂', 'book': '📖', 'scorpion': '🦂',
    'tailless': '🚫', 'whip': '🪵', 'scorpion': '🦂', ' pseudoscorpion': '🦂', 'harvestman': '🕷️',
    'daddy': '👨', 'longlegs': '🦵', 'mite': '🪳', 'tick': '🪳', 'chigger': '🪳',
    'spider': '🕷️', 'mite': '🪳', 'dust': '🌫️', 'mite': '🪳', 'scabies': '🪳',
    'mite': '🪳', 'bird': '🐦', 'mite': '🪳', 'snake': '🐍', 'mite': '🪳',
    'ear': '👂', 'mite': '🪳', 'follicle': '💇', 'mite': '🪳', 'face': '😀',
    'mite': '🪳', 'demodex': '🪳', 'itch': '😣', 'mite': '🪳', 'house': '🏠',
    'dust': '🌫️', 'mite': '🪳', 'storage': '📦', 'mite': '🪳', 'cheese': '🧀',
    'mite': '🪳', 'flour': '🌾', 'mite': '🪳', 'grain': '🌾', 'mite': '🪳',
    'mold': '🍄', 'mite': '🪳', 'strawberry': '🍓', 'mite': '🪳', 'coconut': '🥥',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'varroa': '🪳', 'mite': '🪳',
    'tracheal': '🫁', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'tropilaelaps': '🪳',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'luke': '⬆️', 'mite': '🪳',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'syria': '🇸🇾', 'mite': '🪳',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳',
    'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳',
    'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳',
    'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳',
    'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝',
    'mite': '🪳', 'bee': '🐝', 'mite': '🪳', 'bee': '🐝', 'mite': '🪳'
};

function getEmojiForWord(word, partOfSpeech) {
    const lower = word.toLowerCase().trim();
    
    // Buscar exacto
    if (WORD_EMOJIS[lower]) return WORD_EMOJIS[lower];
    
    // Buscar palabras compuestas
    for (const [key, emoji] of Object.entries(WORD_EMOJIS)) {
        if (lower.includes(key)) return emoji;
    }
    
    // Fallback por categoría gramatical
    if (partOfSpeech === 'verb') return '🏃';
    if (partOfSpeech === 'adjective') return '🎨';
    if (partOfSpeech === 'adverb') return '⏩';
    return '📖';
}

// === CONJUGATION HELPERS ===
const IRREGULAR_VERBS = {
    'be': { past: 'was/were', participle: 'been', third: 'is', gerund: 'being' },
    'have': { past: 'had', participle: 'had', third: 'has', gerund: 'having' },
    'do': { past: 'did', participle: 'done', third: 'does', gerund: 'doing' },
    'go': { past: 'went', participle: 'gone', third: 'goes', gerund: 'going' },
    'come': { past: 'came', participle: 'come', third: 'comes', gerund: 'coming' },
    'see': { past: 'saw', participle: 'seen', third: 'sees', gerund: 'seeing' },
    'know': { past: 'knew', participle: 'known', third: 'knows', gerund: 'knowing' },
    'get': { past: 'got', participle: 'got/gotten', third: 'gets', gerund: 'getting' },
    'make': { past: 'made', participle: 'made', third: 'makes', gerund: 'making' },
    'take': { past: 'took', participle: 'taken', third: 'takes', gerund: 'taking' },
    'think': { past: 'thought', participle: 'thought', third: 'thinks', gerund: 'thinking' },
    'say': { past: 'said', participle: 'said', third: 'says', gerund: 'saying' },
    'tell': { past: 'told', participle: 'told', third: 'tells', gerund: 'telling' },
    'become': { past: 'became', participle: 'become', third: 'becomes', gerund: 'becoming' },
    'leave': { past: 'left', participle: 'left', third: 'leaves', gerund: 'leaving' },
    'feel': { past: 'felt', participle: 'felt', third: 'feels', gerund: 'feeling' },
    'put': { past: 'put', participle: 'put', third: 'puts', gerund: 'putting' },
    'bring': { past: 'brought', participle: 'brought', third: 'brings', gerund: 'bringing' },
    'begin': { past: 'began', participle: 'begun', third: 'begins', gerund: 'beginning' },
    'keep': { past: 'kept', participle: 'kept', third: 'keeps', gerund: 'keeping' },
    'hold': { past: 'held', participle: 'held', third: 'holds', gerund: 'holding' },
    'write': { past: 'wrote', participle: 'written', third: 'writes', gerund: 'writing' },
    'stand': { past: 'stood', participle: 'stood', third: 'stands', gerund: 'standing' },
    'hear': { past: 'heard', participle: 'heard', third: 'hears', gerund: 'hearing' },
    'let': { past: 'let', participle: 'let', third: 'lets', gerund: 'letting' },
    'mean': { past: 'meant', participle: 'meant', third: 'means', gerund: 'meaning' },
    'set': { past: 'set', participle: 'set', third: 'sets', gerund: 'setting' },
    'meet': { past: 'met', participle: 'met', third: 'meets', gerund: 'meeting' },
    'run': { past: 'ran', participle: 'run', third: 'runs', gerund: 'running' },
    'pay': { past: 'paid', participle: 'paid', third: 'pays', gerund: 'paying' },
    'sit': { past: 'sat', participle: 'sat', third: 'sits', gerund: 'sitting' },
    'speak': { past: 'spoke', participle: 'spoken', third: 'speaks', gerund: 'speaking' },
    'lie': { past: 'lay', participle: 'lain', third: 'lies', gerund: 'lying' },
    'lead': { past: 'led', participle: 'led', third: 'leads', gerund: 'leading' },
    'read': { past: 'read', participle: 'read', third: 'reads', gerund: 'reading' },
    'grow': { past: 'grew', participle: 'grown', third: 'grows', gerund: 'growing' },
    'lose': { past: 'lost', participle: 'lost', third: 'loses', gerund: 'losing' },
    'fall': { past: 'fell', participle: 'fallen', third: 'falls', gerund: 'falling' },
    'send': { past: 'sent', participle: 'sent', third: 'sends', gerund: 'sending' },
    'build': { past: 'built', participle: 'built', third: 'builds', gerund: 'building' },
    'understand': { past: 'understood', participle: 'understood', third: 'understands', gerund: 'understanding' },
    'draw': { past: 'drew', participle: 'drawn', third: 'draws', gerund: 'drawing' },
    'break': { past: 'broke', participle: 'broken', third: 'breaks', gerund: 'breaking' },
    'spend': { past: 'spent', participle: 'spent', third: 'spends', gerund: 'spending' },
    'cut': { past: 'cut', participle: 'cut', third: 'cuts', gerund: 'cutting' },
    'rise': { past: 'rose', participle: 'risen', third: 'rises', gerund: 'rising' },
    'drive': { past: 'drove', participle: 'driven', third: 'drives', gerund: 'driving' },
    'wear': { past: 'wore', participle: 'worn', third: 'wears', gerund: 'wearing' },
    'choose': { past: 'chose', participle: 'chosen', third: 'chooses', gerund: 'choosing' },
    'eat': { past: 'ate', participle: 'eaten', third: 'eats', gerund: 'eating' },
    'give': { past: 'gave', participle: 'given', third: 'gives', gerund: 'giving' },
    'find': { past: 'found', participle: 'found', third: 'finds', gerund: 'finding' },
    'buy': { past: 'bought', participle: 'bought', third: 'buys', gerund: 'buying' },
    'sell': { past: 'sold', participle: 'sold', third: 'sells', gerund: 'selling' },
    'teach': { past: 'taught', participle: 'taught', third: 'teaches', gerund: 'teaching' },
    'sleep': { past: 'slept', participle: 'slept', third: 'sleeps', gerund: 'sleeping' },
    'swim': { past: 'swam', participle: 'swum', third: 'swims', gerund: 'swimming' },
    'drink': { past: 'drank', participle: 'drunk', third: 'drinks', gerund: 'drinking' },
    'sing': { past: 'sang', participle: 'sung', third: 'sings', gerund: 'singing' },
    'fly': { past: 'flew', participle: 'flown', third: 'flies', gerund: 'flying' },
    'ring': { past: 'rang', participle: 'rung', third: 'rings', gerund: 'ringing' },
    'shake': { past: 'shook', participle: 'shaken', third: 'shakes', gerund: 'shaking' },
    'catch': { past: 'caught', participle: 'caught', third: 'catches', gerund: 'catching' },
    'fight': { past: 'fought', participle: 'fought', third: 'fights', gerund: 'fighting' },
    'forget': { past: 'forgot', participle: 'forgotten', third: 'forgets', gerund: 'forgetting' },
    'forgive': { past: 'forgave', participle: 'forgiven', third: 'forgives', gerund: 'forgiving' },
    'freeze': { past: 'froze', participle: 'frozen', third: 'freezes', gerund: 'freezing' },
    'hide': { past: 'hid', participle: 'hidden', third: 'hides', gerund: 'hiding' },
    'hit': { past: 'hit', participle: 'hit', third: 'hits', gerund: 'hitting' },
    'hurt': { past: 'hurt', participle: 'hurt', third: 'hurts', gerund: 'hurting' },
    'lay': { past: 'laid', participle: 'laid', third: 'lays', gerund: 'laying' },
    'ride': { past: 'rode', participle: 'ridden', third: 'rides', gerund: 'riding' },
    'shake': { past: 'shook', participle: 'shaken', third: 'shakes', gerund: 'shaking' },
    'show': { past: 'showed', participle: 'shown', third: 'shows', gerund: 'showing' },
    'shut': { past: 'shut', participle: 'shut', third: 'shuts', gerund: 'shutting' },
    'sink': { past: 'sank', participle: 'sunk', third: 'sinks', gerund: 'sinking' },
    'slide': { past: 'slid', participle: 'slid', third: 'slides', gerund: 'sliding' },
    'stick': { past: 'stuck', participle: 'stuck', third: 'sticks', gerund: 'sticking' },
    'strike': { past: 'struck', participle: 'struck', third: 'strikes', gerund: 'striking' },
    'tear': { past: 'tore', participle: 'torn', third: 'tears', gerund: 'tearing' },
    'wake': { past: 'woke', participle: 'woken', third: 'wakes', gerund: 'waking' },
    'beat': { past: 'beat', participle: 'beaten', third: 'beats', gerund: 'beating' },
    'bend': { past: 'bent', participle: 'bent', third: 'bends', gerund: 'bending' },
    'bet': { past: 'bet', participle: 'bet', third: 'bets', gerund: 'betting' },
    'bind': { past: 'bound', participle: 'bound', third: 'binds', gerund: 'binding' },
    'bite': { past: 'bit', participle: 'bitten', third: 'bites', gerund: 'biting' },
    'bleed': { past: 'bled', participle: 'bled', third: 'bleeds', gerund: 'bleeding' },
    'blow': { past: 'blew', participle: 'blown', third: 'blows', gerund: 'blowing' },
    'burn': { past: 'burned/burnt', participle: 'burned/burnt', third: 'burns', gerund: 'burning' },
    'burst': { past: 'burst', participle: 'burst', third: 'bursts', gerund: 'bursting' },
    'cast': { past: 'cast', participle: 'cast', third: 'casts', gerund: 'casting' },
    'creep': { past: 'crept', participle: 'crept', third: 'creeps', gerund: 'creeping' },
    'deal': { past: 'dealt', participle: 'dealt', third: 'deals', gerund: 'dealing' },
    'dig': { past: 'dug', participle: 'dug', third: 'digs', gerund: 'digging' },
    'dream': { past: 'dreamed/dreamt', participle: 'dreamed/dreamt', third: 'dreams', gerund: 'dreaming' },
    'feed': { past: 'fed', participle: 'fed', third: 'feeds', gerund: 'feeding' },
    'flee': { past: 'fled', participle: 'fled', third: 'flees', gerund: 'fleeing' },
    'forbid': { past: 'forbade', participle: 'forbidden', third: 'forbids', gerund: 'forbidding' },
    'grind': { past: 'ground', participle: 'ground', third: 'grinds', gerund: 'grinding' },
    'hang': { past: 'hung/hanged', participle: 'hung/hanged', third: 'hangs', gerund: 'hanging' },
    'kneel': { past: 'knelt', participle: 'knelt', third: 'kneels', gerund: 'kneeling' },
    'lean': { past: 'leaned/leant', participle: 'leaned/leant', third: 'leans', gerund: 'leaning' },
    'leap': { past: 'leaped/leapt', participle: 'leaped/leapt', third: 'leaps', gerund: 'leaping' },
    'light': { past: 'lit/lighted', participle: 'lit/lighted', third: 'lights', gerund: 'lighting' },
    'mow': { past: 'mowed', participle: 'mowed/mown', third: 'mows', gerund: 'mowing' },
    'plead': { past: 'pleaded/pled', participle: 'pleaded/pled', third: 'pleads', gerund: 'pleading' },
    'prove': { past: 'proved', participle: 'proved/proven', third: 'proves', gerund: 'proving' },
    'sew': { past: 'sewed', participle: 'sewed/sewn', third: 'sews', gerund: 'sewing' },
    'shrink': { past: 'shrank', participle: 'shrunk', third: 'shrinks', gerund: 'shrinking' },
    'shut': { past: 'shut', participle: 'shut', third: 'shuts', gerund: 'shutting' },
    'spill': { past: 'spilled/spilt', participle: 'spilled/spilt', third: 'spills', gerund: 'spilling' },
    'spoil': { past: 'spoiled/spoilt', participle: 'spoiled/spoilt', third: 'spoils', gerund: 'spoiling' },
    'spread': { past: 'spread', participle: 'spread', third: 'spreads', gerund: 'spreading' },
    'spring': { past: 'sprang', participle: 'sprung', third: 'springs', gerund: 'springing' },
    'steal': { past: 'stole', participle: 'stolen', third: 'steals', gerund: 'stealing' },
    'swear': { past: 'swore', participle: 'sworn', third: 'swears', gerund: 'swearing' },
    'sweep': { past: 'swept', participle: 'swept', third: 'sweeps', gerund: 'sweeping' },
    'swing': { past: 'swung', participle: 'swung', third: 'swings', gerund: 'swinging' },
    'thrust': { past: 'thrust', participle: 'thrust', third: 'thrusts', gerund: 'thrusting' },
    'weep': { past: 'wept', participle: 'wept', third: 'weeps', gerund: 'weeping' },
    'wind': { past: 'wound', participle: 'wound', third: 'winds', gerund: 'winding' },
    'withdraw': { past: 'withdrew', participle: 'withdrawn', third: 'withdraws', gerund: 'withdrawing' },
    'withhold': { past: 'withheld', participle: 'withheld', third: 'withholds', gerund: 'withholding' },
    'withstand': { past: 'withstood', participle: 'withstood', third: 'withstands', gerund: 'withstanding' },
    'arise': { past: 'arose', participle: 'arisen', third: 'arises', gerund: 'arising' },
    'awake': { past: 'awoke', participle: 'awoken', third: 'awakes', gerund: 'awaking' },
    'bear': { past: 'bore', participle: 'borne/born', third: 'bears', gerund: 'bearing' },
    'broadcast': { past: 'broadcast', participle: 'broadcast', third: 'broadcasts', gerund: 'broadcasting' },
    'cling': { past: 'clung', participle: 'clung', third: 'clings', gerund: 'clinging' },
    'cost': { past: 'cost', participle: 'cost', third: 'costs', gerund: 'costing' },
    'dive': { past: 'dived/dove', participle: 'dived', third: 'dives', gerund: 'diving' },
    'forsake': { past: 'forsook', participle: 'forsaken', third: 'forsakes', gerund: 'forsaking' },
    'grind': { past: 'ground', participle: 'ground', third: 'grinds', gerund: 'grinding' },
    'heave': { past: 'heaved/hove', participle: 'heaved/hove', third: 'heaves', gerund: 'heaving' },
    'learn': { past: 'learned/learnt', participle: 'learned/learnt', third: 'learns', gerund: 'learning' },
    'smell': { past: 'smelled/smelt', participle: 'smelled/smelt', third: 'smells', gerund: 'smelling' },
    'spell': { past: 'spelled/spelt', participle: 'spelled/spelt', third: 'spells', gerund: 'spelling' },
    'spill': { past: 'spilled/spilt', participle: 'spilled/spilt', third: 'spills', gerund: 'spilling' },
    'spoil': { past: 'spoiled/spoilt', participle: 'spoiled/spoilt', third: 'spoils', gerund: 'spoiling' },
    'stink': { past: 'stank', participle: 'stunk', third: 'stinks', gerund: 'stinking' },
    'strew': { past: 'strewed', participle: 'strewed/strewn', third: 'strews', gerund: 'strewing' },
    'strive': { past: 'strove', participle: 'striven', third: 'strives', gerund: 'striving' },
    'thrive': { past: 'thrived/throve', participle: 'thrived', third: 'thrives', gerund: 'thriving' },
    'tread': { past: 'trod', participle: 'trod/trodden', third: 'treads', gerund: 'treading' },
    'undergo': { past: 'underwent', participle: 'undergone', third: 'undergoes', gerund: 'undergoing' },
    'undo': { past: 'undid', participle: 'undone', third: 'undoes', gerund: 'undoing' },
    'upset': { past: 'upset', participle: 'upset', third: 'upsets', gerund: 'upsetting' },
    'wed': { past: 'wed/wedded', participle: 'wed/wedded', third: 'weds', gerund: 'wedding' },
    'wet': { past: 'wet/wetted', participle: 'wet/wetted', third: 'wets', gerund: 'wetting' }
};

function getConjugations(word, partOfSpeech) {
    if (partOfSpeech !== 'verb') return null;
    
    const base = word.toLowerCase().trim();
    const irregular = IRREGULAR_VERBS[base];
    
    if (irregular) {
        return {
            base: base,
            past: irregular.past,
            participle: irregular.participle,
            third: irregular.third,
            gerund: irregular.gerund,
            isRegular: false
        };
    }
    
    // Reglas para verbos regulares
    const endsE = base.endsWith('e');
    const endsY = base.endsWith('y') && !/[aeiou]/.test(base[base.length - 2]);
    const cvcPattern = /[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxz]$/.test(base);
    
    let past, participle, third, gerund;
    
    if (endsY && !endsE) {
        past = base.slice(0, -1) + 'ied';
        participle = base.slice(0, -1) + 'ied';
    } else if (endsE) {
        past = base + 'd';
        participle = base + 'd';
    } else {
        past = base + 'ed';
        participle = base + 'ed';
    }
    
    // Double consonant for CVC pattern (1 syllable or stressed last syllable simplified)
    if (cvcPattern && base.length <= 6) {
        past = base + base.slice(-1) + 'ed';
        participle = base + base.slice(-1) + 'ed';
    }
    
    // Third person
    if (endsY && !/[aeiou]/.test(base[base.length - 2])) {
        third = base.slice(0, -1) + 'ies';
    } else if (base.endsWith('s') || base.endsWith('x') || base.endsWith('z') || base.endsWith('ch') || base.endsWith('sh') || base.endsWith('o')) {
        third = base + 'es';
    } else {
        third = base + 's';
    }
    
    // Gerund
    if (endsE) {
        gerund = base.slice(0, -1) + 'ing';
    } else if (cvcPattern && base.length <= 6) {
        gerund = base + base.slice(-1) + 'ing';
    } else {
        gerund = base + 'ing';
    }
    
    return {
        base: base,
        past: past,
        participle: participle,
        third: third,
        gerund: gerund,
        isRegular: true
    };
}

// === DICTIONARY SEARCH ===
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('search-results');

let lastSearchedWord = null;
let lastSearchData = null;
let lastTranslation = null;
let lastSynonyms = [];
let lastImageUrl = null;

async function searchWord(word) {
    if (!word.trim()) return;
    
    resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';
    
    try {
        // Llamadas en paralelo: diccionario + traducción + sinónimos + imagen Wikipedia
        const [dictRes, transRes, synRes, wikiRes] = await Promise.allSettled([
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`),
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word.trim())}&langpair=en|es`),
            fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word.trim().toLowerCase())}&max=5`),
            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word.trim().toLowerCase())}`)
        ]);
        
        if (dictRes.status !== 'fulfilled' || !dictRes.value.ok) {
            throw new Error('Palabra no encontrada');
        }
        
        const data = await dictRes.value.json();
        lastSearchedWord = word.trim().toLowerCase();
        lastSearchData = data;
        
        // Recolectar traducciones
        const translations = [];
        
        // Guardar sinónimos en inglés
        lastSynonyms = [];
        
        // 1. Traducción principal
        if (transRes.status === 'fulfilled' && transRes.value.ok) {
            try {
                const transData = await transRes.value.json();
                const mainTrans = transData.responseData?.translatedText;
                if (mainTrans && mainTrans.toLowerCase() !== word.trim().toLowerCase()) {
                    translations.push(mainTrans);
                }
            } catch (e) {}
        }
        
        // 2. Procesar sinónimos en inglés y traducirlos
        if (synRes.status === 'fulfilled' && synRes.value.ok) {
            try {
                const synonyms = await synRes.value.json();
                if (synonyms.length > 0) {
                    lastSynonyms = synonyms.slice(0, 8).map(s => s.word);
                    
                    // Traducir sinónimos para más opciones en español
                    const synWords = lastSynonyms.slice(0, 4);
                    if (synWords.length > 0) {
                        const synQuery = synWords.join(', ');
                        const synTransRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(synQuery)}&langpair=en|es`);
                        if (synTransRes.ok) {
                            const synTransData = await synTransRes.json();
                            if (synTransData.responseData?.translatedText) {
                                const synTranslations = synTransData.responseData.translatedText
                                    .split(/,| y /)
                                    .map(t => t.trim())
                                    .filter(t => t.length > 1 && t.toLowerCase() !== word.trim().toLowerCase());
                                translations.push(...synTranslations);
                            }
                        }
                    }
                }
            } catch (e) {}
        }
        
        // Limpiar duplicados (sin distinguir mayúsculas) y limitar
        const seen = new Set();
        const uniqueTranslations = [];
        for (const t of translations) {
            const lower = t.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                uniqueTranslations.push(t);
                if (uniqueTranslations.length >= 5) break;
            }
        }
        
        lastTranslation = uniqueTranslations.join(', ');
        
        // 3. Procesar imagen de Wikipedia
        lastImageUrl = null;
        if (wikiRes.status === 'fulfilled' && wikiRes.value.ok) {
            try {
                const wikiData = await wikiRes.value.json();
                if (wikiData.thumbnail?.source) {
                    lastImageUrl = wikiData.thumbnail.source;
                }
            } catch (e) {}
        }
        
        renderResults(data, lastTranslation, lastImageUrl);
    } catch (err) {
        resultsContainer.innerHTML = `
            <div class="error-card">
                <p>😕 No encontramos "${word}"</p>
                <p style="font-size:14px; margin-top:8px;">Verifica la ortografía o intenta con otra palabra.</p>
            </div>
        `;
    }
}

function renderResults(data, translation = '', imageUrl = null) {
    const entry = data[0];
    let html = '';
    
    const phonetic = entry.phonetics?.find(p => p.text)?.text || '';
    const audio = entry.phonetics?.find(p => p.audio)?.audio || '';
    
    html += `<div class="word-card">`;
    html += `<h2>${entry.word}</h2>`;
    if (phonetic) html += `<div class="phonetic">${phonetic} ${audio ? `<button onclick="playAudio('${audio}')" style="background:none;border:none;font-size:18px;cursor:pointer;">🔊</button>` : ''}</div>`;
    
    // Mostrar imagen de Wikipedia o emoji
    if (imageUrl) {
        html += `<div style="text-align:center; margin-bottom:12px;">`;
        html += `<img src="${imageUrl}" alt="${entry.word}" style="max-width:100%; max-height:200px; border-radius:12px; object-fit:cover;">`;
        html += `</div>`;
    } else {
        const firstPos = entry.meanings[0]?.partOfSpeech || '';
        const emoji = getEmojiForWord(entry.word, firstPos);
        html += `<div style="text-align:center; margin-bottom:12px; font-size:80px; line-height:1;">${emoji}</div>`;
    }
    
    // Mostrar traducción editable
    html += `<div class="translation-box">`;
    html += `<div class="translation-label">🇪🇸 Traducción:</div>`;
    html += `<input type="text" id="manual-translation" class="translation-input" value="${translation}" placeholder="Escribe la traducción...">`;
    html += `<div class="translation-tip">💡 Puedes editar o agregar más traducciones</div>`;
    html += `</div>`;
    
    let isVerb = false;
    
    entry.meanings.forEach((meaning, idx) => {
        if (idx > 2) return; // Limit to 3 meanings
        html += `<div class="meaning">`;
        html += `<div class="part-of-speech">${meaning.partOfSpeech}</div>`;
        
        meaning.definitions.slice(0, 2).forEach(def => {
            html += `<div class="definition">${def.definition}</div>`;
            if (def.example) html += `<div class="example">"${def.example}"</div>`;
        });
        
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            html += `<div class="synonyms"><strong>Sinónimos:</strong> ${meaning.synonyms.slice(0, 5).join(', ')}</div>`;
        }
        
        html += `</div>`;
        
        if (meaning.partOfSpeech === 'verb') isVerb = true;
    });
    
    // Sinónimos en inglés desde Datamuse
    if (lastSynonyms.length > 0) {
        html += `<div class="synonyms-section">`;
        html += `<div class="section-label">🔗 Sinónimos en inglés:</div>`;
        html += `<div style="display:flex; flex-wrap:wrap; gap:6px;">`;
        lastSynonyms.forEach(syn => {
            html += `<span class="synonym-tag">${syn}</span>`;
        });
        html += `</div></div>`;
    }
    
    // Conjugaciones para verbos
    if (isVerb) {
        const conj = getConjugations(entry.word, 'verb');
        if (conj) {
            html += `<div class="conjugations-box">`;
            html += `<div class="section-label">📋 Conjugaciones:</div>`;
            html += `<div class="conj-grid">`;
            html += `<div><span class="conj-label">Base:</span> <strong>${conj.base}</strong></div>`;
            html += `<div><span class="conj-label">Pasado:</span> <strong>${conj.past}</strong></div>`;
            html += `<div><span class="conj-label">Participio:</span> <strong>${conj.participle}</strong></div>`;
            html += `<div><span class="conj-label">3ra persona:</span> <strong>${conj.third}</strong></div>`;
            html += `<div class="conj-grid full-width"><span class="conj-label">Gerundio (-ing):</span> <strong>${conj.gerund}</strong></div>`;
            html += `</div>`;
            if (conj.isRegular) {
                html += `<div class="conj-type">✓ Verbo regular</div>`;
            } else {
                html += `<div class="conj-type">⚡ Verbo irregular</div>`;
            }
            html += `</div>`;
        }
    }
    
    html += `<button class="btn-save" onclick="openAddToGroup('${entry.word}')">➕ Guardar en un grupo</button>`;
    html += `</div>`;
    
    resultsContainer.innerHTML = html;
}

function playAudio(url) {
    const audio = new Audio(url);
    audio.play().catch(() => {});
}

searchBtn.addEventListener('click', () => searchWord(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWord(searchInput.value);
});

// === ADD TO GROUP ===
const modalAdd = document.getElementById('modal-add-to-group');
const addGroupList = document.getElementById('add-group-list');

let pendingWord = null;

function openAddToGroup(word) {
    const data = getWordData(word);
    pendingWord = {
        word: data.word,
        translation: data.translation,
        definition: data.definition,
        image: data.image,
        date: new Date().toISOString()
    };
    
    renderAddGroupList();
    modalAdd.classList.add('active');
}

function getWordData(word) {
    const wordLower = word.toLowerCase();
    let definition = '';
    let translation = lastTranslation || '';
    
    // Capturar traducción manual si existe
    const manualInput = document.getElementById('manual-translation');
    if (manualInput && manualInput.value.trim()) {
        translation = manualInput.value.trim();
    }
    
    if (lastSearchData) {
        const entry = lastSearchData.find(e => e.word.toLowerCase() === wordLower);
        if (entry) {
            const meaning = entry.meanings[0];
            if (meaning) {
                const def = meaning.definitions[0];
                definition = def ? def.definition : '';
            }
        }
    }
    
    return { word, definition, translation, image: lastImageUrl };
}

function renderAddGroupList() {
    addGroupList.innerHTML = '';
    
    if (appData.groups.length === 0) {
        addGroupList.innerHTML = `
            <div class="empty-state">
                <p>Aún no tienes grupos</p>
            </div>
        `;
    } else {
        appData.groups.forEach((group, idx) => {
            const div = document.createElement('div');
            div.className = 'group-option';
            div.textContent = `${group.name} (${group.words.length} palabras)`;
            div.onclick = () => addWordToGroup(idx);
            addGroupList.appendChild(div);
        });
    }
    
    const newDiv = document.createElement('div');
    newDiv.className = 'group-option new-group-opt';
    newDiv.textContent = '＋ Crear nuevo grupo';
    newDiv.onclick = () => {
        modalAdd.classList.remove('active');
        openNewGroupModal(true);
    };
    addGroupList.appendChild(newDiv);
}

function addWordToGroup(groupIndex) {
    const group = appData.groups[groupIndex];
    // Check if word already exists
    const exists = group.words.some(w => w.word.toLowerCase() === pendingWord.word.toLowerCase());
    if (exists) {
        alert('Esta palabra ya está en el grupo');
        modalAdd.classList.remove('active');
        return;
    }
    
    // Guardar directamente, la imagen de Wikipedia ya viene en pendingWord si la encontró
    group.words.push(pendingWord);
    saveData(appData);
    modalAdd.classList.remove('active');
    
    // Show saved message
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        const msg = document.createElement('div');
        msg.className = 'saved-message';
        msg.textContent = `✅ Guardada en "${group.name}"`;
        saveBtn.parentElement.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }
}

document.getElementById('btn-cancel-add').addEventListener('click', () => {
    modalAdd.classList.remove('active');
});

// === GROUPS ===
function renderGroups() {
    const list = document.getElementById('groups-list');
    
    if (appData.groups.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <p>No tienes grupos aún</p>
                <p style="font-size:14px; margin-top:8px;">Toca el + arriba para crear uno</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    appData.groups.forEach((group, idx) => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <div>
                <h3>${group.name}</h3>
                <div class="word-count">${group.words.length} palabra${group.words.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="arrow">›</div>
        `;
        card.addEventListener('click', () => openGroup(idx));
        list.appendChild(card);
    });
}

// New Group Modal
const modalNewGroup = document.getElementById('modal-new-group');
let newGroupAfterAdd = false;

function openNewGroupModal(afterAdd = false) {
    newGroupAfterAdd = afterAdd;
    document.getElementById('new-group-name').value = '';
    modalNewGroup.classList.add('active');
    setTimeout(() => document.getElementById('new-group-name').focus(), 100);
}

document.getElementById('btn-new-group').addEventListener('click', () => openNewGroupModal(false));
document.getElementById('btn-cancel-group').addEventListener('click', () => {
    modalNewGroup.classList.remove('active');
    if (newGroupAfterAdd) modalAdd.classList.add('active');
});

document.getElementById('btn-create-group').addEventListener('click', () => {
    const name = document.getElementById('new-group-name').value.trim();
    if (!name) return;
    
    const newGroup = {
        name: name,
        words: [],
        created: new Date().toISOString()
    };
    
    appData.groups.push(newGroup);
    saveData(appData);
    modalNewGroup.classList.remove('active');
    
    if (newGroupAfterAdd && pendingWord) {
        addWordToGroup(appData.groups.length - 1);
    } else {
        renderGroups();
    }
});

document.getElementById('new-group-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-create-group').click();
});

// === IMAGE HELPERS ===
function resizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > h) {
                    if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; }
                } else {
                    if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// === IMAGE MODAL ===
const modalImage = document.getElementById('modal-image');
const imageFileInput = document.getElementById('image-file');
const imagePreviewContainer = document.getElementById('image-preview-container');
let imageTargetWord = null; // { groupIndex, wordIndex }

function openImageModal(groupIdx, wordIdx) {
    imageTargetWord = { groupIdx, wordIdx };
    
    const title = document.getElementById('image-modal-title');
    const btnRemove = document.getElementById('btn-remove-image');
    
    title.textContent = '📷 Cambiar imagen';
    const existingImage = appData.groups[groupIdx].words[wordIdx].image;
    
    if (existingImage) {
        imagePreviewContainer.innerHTML = `<img src="${existingImage}" style="max-width:100%; max-height:200px; border-radius:12px;">`;
        btnRemove.style.display = 'block';
    } else {
        const word = appData.groups[groupIdx].words[wordIdx].word;
        const emoji = getEmojiForWord(word, '');
        imagePreviewContainer.innerHTML = `<div style="font-size:100px; text-align:center; padding:20px;">${emoji}</div><div style="text-align:center; color:var(--text-secondary); font-size:14px;">Emoji automático</div>`;
        btnRemove.style.display = 'none';
    }
    
    modalImage.classList.add('active');
}

document.getElementById('btn-select-image').addEventListener('click', () => {
    imageFileInput.click();
});

imageFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const resized = await resizeImage(file, 400, 400, 0.7);
        imagePreviewContainer.innerHTML = `<img src="${resized}" style="max-width:100%; max-height:200px; border-radius:12px;">`;
        document.getElementById('btn-remove-image').style.display = 'block';
        
        appData.groups[imageTargetWord.groupIdx].words[imageTargetWord.wordIdx].image = resized;
        saveData(appData);
        renderWordsList();
    } catch (err) {
        alert('❌ Error al procesar la imagen');
    }
    imageFileInput.value = '';
});

document.getElementById('btn-remove-image').addEventListener('click', () => {
    delete appData.groups[imageTargetWord.groupIdx].words[imageTargetWord.wordIdx].image;
    saveData(appData);
    renderWordsList();
    imagePreviewContainer.innerHTML = '';
    document.getElementById('btn-remove-image').style.display = 'none';
});

document.getElementById('btn-cancel-image').addEventListener('click', () => {
    modalImage.classList.remove('active');
    imageTargetWord = null;
});

// === GROUP DETAIL ===
let currentGroupIndex = null;

function openGroup(index) {
    currentGroupIndex = index;
    const group = appData.groups[index];
    document.getElementById('group-detail-title').textContent = group.name;
    renderWordsList();
    showScreen('screen-group-detail');
}

function renderWordsList() {
    const list = document.getElementById('words-list');
    const group = appData.groups[currentGroupIndex];
    
    if (group.words.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <p>Este grupo está vacío</p>
                <p style="font-size:14px; margin-top:8px;">Busca palabras y guárdalas aquí</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    group.words.forEach((word, idx) => {
        const item = document.createElement('div');
        item.className = 'word-item';
        
        // Formatear traducciones: separar por comas y mostrar como pills
        let transHtml = '';
        if (word.translation) {
            const transList = word.translation.split(',').map(t => t.trim()).filter(Boolean);
            transHtml = transList.map(t => `<span class="translation-tag">${t}</span>`).join(' ');
        }
        
        const subText = word.definition ? `<div style="font-size:12px; color:var(--text-secondary); margin-top:6px; font-style:italic; line-height:1.4;">${word.definition}</div>` : '';
        const thumb = word.image 
            ? `<img src="${word.image}" class="word-thumb">` 
            : `<div class="word-thumb" style="display:flex; align-items:center; justify-content:center; font-size:30px; background:var(--bg);">${getEmojiForWord(word.word, '')}</div>`;
        
        item.innerHTML = `
            ${thumb}
            <div style="flex:1; min-width:0;">
                <div class="word-text">${word.word}</div>
                ${transHtml ? `<div style="margin-top:4px;">${transHtml}</div>` : ''}
                ${subText}
            </div>
            <div class="word-actions">
                <button class="btn-image" title="Imagen">📷</button>
                <button class="btn-delete">🗑</button>
            </div>
        `;
        item.querySelector('.btn-image').addEventListener('click', (e) => {
            e.stopPropagation();
            openImageModal(currentGroupIndex, idx);
        });
        item.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteWord(idx);
        });
        list.appendChild(item);
    });
}

function deleteWord(wordIndex) {
    if (!confirm('¿Eliminar esta palabra?')) return;
    appData.groups[currentGroupIndex].words.splice(wordIndex, 1);
    saveData(appData);
    renderWordsList();
}

document.getElementById('btn-back-from-group').addEventListener('click', () => {
    showScreen('screen-groups');
});

// === GROUP OPTIONS ===
const modalGroupOptions = document.getElementById('modal-group-options');
const modalRenameGroup = document.getElementById('modal-rename-group');

document.getElementById('btn-group-menu').addEventListener('click', () => {
    modalGroupOptions.classList.add('active');
});

document.getElementById('btn-cancel-group-options').addEventListener('click', () => {
    modalGroupOptions.classList.remove('active');
});

// Renombrar grupo
document.getElementById('btn-rename-group').addEventListener('click', () => {
    modalGroupOptions.classList.remove('active');
    const group = appData.groups[currentGroupIndex];
    document.getElementById('rename-group-input').value = group.name;
    modalRenameGroup.classList.add('active');
    setTimeout(() => document.getElementById('rename-group-input').focus(), 100);
});

document.getElementById('btn-cancel-rename').addEventListener('click', () => {
    modalRenameGroup.classList.remove('active');
});

document.getElementById('btn-confirm-rename').addEventListener('click', () => {
    const newName = document.getElementById('rename-group-input').value.trim();
    if (!newName) return;
    
    appData.groups[currentGroupIndex].name = newName;
    saveData(appData);
    document.getElementById('group-detail-title').textContent = newName;
    modalRenameGroup.classList.remove('active');
    renderGroups();
});

document.getElementById('rename-group-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-confirm-rename').click();
});

// Eliminar grupo
document.getElementById('btn-delete-group').addEventListener('click', () => {
    modalGroupOptions.classList.remove('active');
    const group = appData.groups[currentGroupIndex];
    if (!confirm(`¿Eliminar el grupo "${group.name}"?\n\nSe borrarán ${group.words.length} palabra(s). Esta acción no se puede deshacer.`)) {
        return;
    }
    
    appData.groups.splice(currentGroupIndex, 1);
    saveData(appData);
    showScreen('screen-groups');
    renderGroups();
});

// === FLASHCARDS ===
let flashcardsQueue = [];
let currentCardIndex = 0;
let flashcardMode = 'study'; // 'study' or 'test'

function enterFlashcards(mode) {
    const group = appData.groups[currentGroupIndex];
    if (group.words.length === 0) {
        alert('Este grupo está vacío. Agrega palabras primero.');
        return;
    }
    flashcardMode = mode;
    // Actualizar botones en el header del grupo
    document.getElementById('btn-study-mode').classList.toggle('active', mode === 'study');
    document.getElementById('btn-test-mode').classList.toggle('active', mode === 'test');
    startFlashcards();
}

document.getElementById('btn-study-mode').addEventListener('click', () => enterFlashcards('study'));
document.getElementById('btn-test-mode').addEventListener('click', () => enterFlashcards('test'));

function startFlashcards() {
    const group = appData.groups[currentGroupIndex];
    flashcardsQueue = [...group.words];
    // Shuffle
    flashcardsQueue.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    
    showScreen('screen-flashcards');
    showCard();
}

function showCard() {
    const finishedDiv = document.getElementById('flashcard-finished');
    const flashcard = document.getElementById('flashcard');
    const controls = document.querySelector('.flashcard-controls');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('flashcard-progress-text');
    
    if (currentCardIndex >= flashcardsQueue.length) {
        flashcard.style.display = 'none';
        controls.style.display = 'none';
        progressBar.style.display = 'none';
        progressText.style.display = 'none';
        finishedDiv.style.display = 'block';
        return;
    }
    
    flashcard.style.display = 'block';
    controls.style.display = 'flex';
    progressBar.style.display = 'block';
    progressText.style.display = 'block';
    finishedDiv.style.display = 'none';
    flashcard.classList.remove('flipped');
    
    const card = flashcardsQueue[currentCardIndex];
    document.getElementById('flashcard-word').textContent = card.word;
    document.getElementById('flashcard-translation').textContent = 'Toca para ver traducción';
    
    // Mostrar imagen o emoji según modo
    const frontImageContainer = document.getElementById('flashcard-image-front');
    const backImageContainer = document.getElementById('flashcard-image-back');
    const emoji = getEmojiForWord(card.word, '');
    const emojiHtml = `<div style="font-size:80px; line-height:1; text-align:center;">${emoji}</div>`;
    
    if (card.image) {
        const imgHtml = `<img src="${card.image}" alt="${card.word}">`;
        if (flashcardMode === 'study') {
            frontImageContainer.style.display = 'flex';
            frontImageContainer.innerHTML = imgHtml;
            backImageContainer.innerHTML = imgHtml;
        } else {
            frontImageContainer.style.display = 'none';
            frontImageContainer.innerHTML = '';
            backImageContainer.innerHTML = imgHtml;
        }
    } else {
        // Sin imagen: mostrar emoji
        if (flashcardMode === 'study') {
            frontImageContainer.style.display = 'flex';
            frontImageContainer.innerHTML = emojiHtml;
            backImageContainer.innerHTML = emojiHtml;
        } else {
            frontImageContainer.style.display = 'none';
            frontImageContainer.innerHTML = '';
            backImageContainer.innerHTML = emojiHtml;
        }
    }
    
    // Preparar contenido del reverso
    let backContent = '';
    if (card.translation) {
        const transList = card.translation.split(',').map(t => t.trim()).filter(Boolean);
        const transHtml = transList.map(t => `<span style="display:inline-block; background:rgba(255,255,255,0.25); padding:4px 10px; border-radius:8px; margin:2px; font-size:18px;">${t}</span>`).join('');
        backContent += `<div style="margin-bottom:12px; text-align:center;">${transHtml}</div>`;
    }
    if (card.definition) {
        backContent += `<div style="font-size:15px; opacity:0.9; line-height:1.4;">${card.definition}</div>`;
    }
    if (!backContent) {
        backContent = '<div style="font-size:16px; opacity:0.9;">Sin traducción ni definición</div>';
    }
    document.getElementById('flashcard-definition').innerHTML = backContent;
    
    const progress = ((currentCardIndex + 1) / flashcardsQueue.length) * 100;
    document.getElementById('flashcard-progress').style.width = progress + '%';
    document.getElementById('flashcard-progress-text').textContent = `${currentCardIndex + 1} / ${flashcardsQueue.length}`;
}

document.getElementById('flashcard').addEventListener('click', () => {
    document.getElementById('flashcard').classList.toggle('flipped');
});

document.getElementById('btn-hard').addEventListener('click', () => {
    // Put card at the end to review again
    const card = flashcardsQueue[currentCardIndex];
    flashcardsQueue.splice(currentCardIndex, 1);
    flashcardsQueue.push(card);
    showCard();
});

document.getElementById('btn-easy').addEventListener('click', () => {
    currentCardIndex++;
    showCard();
});

document.getElementById('btn-restart-flashcards').addEventListener('click', () => {
    currentCardIndex = 0;
    flashcardsQueue.sort(() => Math.random() - 0.5);
    showCard();
});

document.getElementById('btn-back-from-flashcards').addEventListener('click', () => {
    showScreen('screen-group-detail');
});

// === BACKUP / EXPORT / IMPORT ===
const modalBackup = document.getElementById('modal-backup');

function openBackupModal() {
    modalBackup.classList.add('active');
}

document.getElementById('btn-backup').addEventListener('click', openBackupModal);
document.getElementById('btn-cancel-backup').addEventListener('click', () => {
    modalBackup.classList.remove('active');
});

// Exportar
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mydict-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Archivo descargado. Guárdalo para importarlo en otro dispositivo.');
    modalBackup.classList.remove('active');
}

document.getElementById('btn-export').addEventListener('click', exportData);

// Importar
const importFileInput = document.getElementById('import-file');

document.getElementById('btn-import').addEventListener('click', () => {
    importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validar estructura básica
            if (!importedData.groups || !Array.isArray(importedData.groups)) {
                throw new Error('El archivo no tiene el formato correcto');
            }
            
            if (!confirm(`¿Importar ${importedData.groups.length} grupo(s)? Esto reemplazará tus listas actuales.`)) {
                return;
            }
            
            appData = importedData;
            saveData(appData);
            renderGroups();
            
            alert('✅ Listas importadas correctamente');
            modalBackup.classList.remove('active');
            importFileInput.value = '';
        } catch (err) {
            alert('❌ Error al importar: ' + err.message);
            importFileInput.value = '';
        }
    };
    reader.readAsText(file);
});

// === SERVICE WORKER ===
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .catch(err => console.log('SW registration failed:', err));
}

// === INIT ===
renderGroups();
