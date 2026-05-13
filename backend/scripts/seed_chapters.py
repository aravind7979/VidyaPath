import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import AsyncSessionLocal, engine, Base
from models import Chapter

CURRICULUM = {
  1: {
    "Telugu": ["మన పరిసరాలు","అమ్మ ప్రేమ","పూలతోట","మన పాఠశాల","రంగుల ప్రపంచం","నీళ్ళు మనకు జీవం","మన ఇల్లు","చిన్న పక్షి","సూర్యుడు వస్తాడు","మన కుటుంబం"],
    "Hindi": ["मेरा परिवार","फूल और पत्ते","हमारा घर","पानी की बात","सुबह की सैर","रंग बिरंगी दुनिया","मेरे दोस्त","छोटी चिड़िया","बाजार जाना","त्योहार"],
    "English": ["My Family","At School","Fruits and Vegetables","Animals Around Us","Colours and Shapes","My Body","Days and Months","The Little Seed","Rain and Sunshine","My Neighbourhood"],
    "Maths": ["Numbers 1 to 10","Numbers 11 to 20","Addition (Single Digit)","Subtraction (Single Digit)","Shapes Around Us","Measurement – Long and Short","Time – Day and Night","Money – Coins and Notes","Patterns","Data Handling – Tally Marks"],
    "Science": ["Plants Around Us","Animals Around Us","My Body","Food We Eat","Water","Air Around Us","Weather","Our Senses","Light and Shadow","Materials Around Us"],
    "Social Studies": ["My Family","My School","My Neighbourhood","People Who Help Us","Our Festivals","Transport","Communication","Food and Clothing","Our Country India","Civic Sense"],
    "Computer Science": ["Introduction to Computers","Parts of a Computer","Keyboard and Mouse","Using Paint","Internet Basics","Safety on Computer","Digital Drawing","Computer Manners","Storage Devices","Fun with Games"]
  },
  2: {
    "Telugu": ["పసిపిల్లల పాట","మన గ్రామం","పంచతంత్ర కథ","నది పుట్టుక","మన పండగలు","రైతు జీవితం","జంతువుల స్నేహం","ఆకాశం అందాలు","మన దేశం","తెలుగు వీరులు"],
    "Hindi": ["हमारा गाँव","नदी की यात्रा","जानवरों की दुनिया","मेले का दिन","हमारे त्योहार","पेड़ हमारे मित्र","आकाश की बातें","किसान की मेहनत","देश के वीर","पर्यावरण"],
    "English": ["The Helpful Robot","A Day at the Zoo","Seasons","The Magic Garden","Going on a Trip","Our Festivals","Wild Animals","The Clever Crow","Water Cycle","India – My Country"],
    "Maths": ["Numbers up to 100","Addition (Two Digit)","Subtraction (Two Digit)","Multiplication – Concept","Division – Concept","Length and Weight","Time – Hours and Minutes","Money Transactions","Fractions – Half and Quarter","Geometry – 2D Shapes"],
    "Science": ["Living and Non-living Things","Plants – Parts and Functions","Animals – Habitat","Human Body","Food and Nutrition","Water Cycle","Air and Its Properties","Soil","Simple Machines","Safety and First Aid"],
    "Social Studies": ["Family and Community","Village and City Life","Maps and Directions","Transport and Communication","Occupations","Natural Resources","Our State","National Symbols","Rights and Duties","Historical Monuments"],
    "Computer Science": ["Working of a Computer","Input and Output Devices","More about Keyboard","Wordpad Basics","Internet and Web","File Management","MS Paint Tools","Digital Safety","Computer in daily life","Typing Practice"]
  },
  3: {
    "Telugu": ["తెలుగు నాట కళలు","గురువు గొప్పతనం","ప్రకృతి అందాలు","వ్యవసాయం","మన సంస్కృతి","పర్యావరణ రక్షణ","దేశభక్తి","విజ్ఞాన ప్రపంచం","నీటి నిర్వహణ","మహిళా శక్తి"],
    "Hindi": ["हमारी संस्कृति","प्रकृति का उपहार","विज्ञान की दुनिया","महान व्यक्तित्व","हमारी भाषा","पर्यावरण संरक्षण","देश भक्ति","कृषि और किसान","जल संरक्षण","नारी शक्ति"],
    "English": ["The Adventure of Tom","Discovering India","Science is Fun","Great Personalities","Language and Communication","Protect Our Environment","Patriotism","Farming Communities","Save Water","Women Achievers"],
    "Maths": ["4-Digit Numbers","Addition and Subtraction","Multiplication Tables","Division","Fractions","Measurement","Perimeter","Time and Calendar","Money Problems","Data Handling"],
    "Science": ["Plants – Reproduction","Animal Kingdom","Nutrition in Plants","Nutrition in Animals","Human Skeleton","Force and Motion","Light","Sound","Electricity Basics","Environment and Ecology"],
    "Social Studies": ["Globe and Maps","Physical Features of India","Rivers of India","Climate","Natural Vegetation","Wildlife","Means of Transport","Communication Systems","Industries","Democracy Basics"],
    "Computer Science": ["Introduction to Windows","Word Processing Basics","Formatting Text","Internet Searches","Email Basics","Multimedia and Animation","Introduction to Logo","Drawing with Logo","Computer Virus","Cyber Safety"]
  },
  4: {
    "Telugu": ["రామాయణ కథ","మహాభారత సారాంశం","భాష నేర్చుకుందాం","విజ్ఞాన ప్రగతి","పర్యావరణ సందేశం","ఆర్థిక వ్యవస్థ","సమాజ సేవ","స్వాతంత్ర్య సమరం","సాంస్కృతిక వారసత్వం","ప్రజాస్వామ్యం"],
    "Hindi": ["रामायण की कहानी","महाभारत का सार","भाषा सीखें","विज्ञान की प्रगति","पर्यावरण का संदेश","अर्थव्यवस्था","समाज सेवा","स्वतंत्रता संग्राम","सांस्कृतिक विरासत","लोकतंत्र"],
    "English": ["The Ramayana Story","Mahabharata Highlights","Parts of Speech","Scientific Progress","Environmental Message","Our Economy","Social Service","Freedom Struggle","Cultural Heritage","Democracy"],
    "Maths": ["Large Numbers","Roman Numerals","Factors and Multiples","Fractions and Decimals","Geometry – Angles","Area and Perimeter","Patterns and Symmetry","Time – 24hr Clock","Money and Bills","Statistics"],
    "Science": ["Cell – Basic Unit of Life","Photosynthesis","Digestion","Respiration","Nervous System","Magnetism","Electricity Circuits","Heat and Temperature","Rocks and Minerals","Pollution"],
    "Social Studies": ["Major Landforms","Climate Zones","Agriculture in India","Industries of India","Trade and Commerce","Ancient Civilisations","Medieval India","Freedom Movement","Indian Constitution","Local Self Government"],
    "Computer Science": ["Advanced Word Processing","Working with Tables","Introduction to Powerpoint","Creating Presentations","Internet and Networking","Algorithm Basics","Programming in Logo","Scratch Introduction","Creating Games","Tech Ethics"]
  },
  5: {
    "Telugu": ["తెలుగు సాహిత్యం","కవి పరిచయం","వ్యాకరణం","నాటక రచన","పద్య పఠనం","గద్య రచన","అనువాదం","పత్రికా రచన","సమాచార సాంకేతికత","తెలుగు సినిమా"],
    "Hindi": ["हिन्दी साहित्य","कवि परिचय","व्याकरण","नाटक लेखन","पद्य पठन","गद्य लेखन","अनुवाद","पत्रकारिता","सूचना प्रौद्योगिकी","हिन्दी सिनेमा"],
    "English": ["English Literature","Grammar – Tenses","Reading Comprehension","Creative Writing","Poetry Appreciation","Drama","Translation Skills","Journalism Basics","Digital Literacy","Indian English Writers"],
    "Maths": ["Number Systems","HCF and LCM","Ratio and Proportion","Percentage","Profit and Loss","Simple Interest","Geometry – Triangles","Volume and Surface Area","Data Interpretation","Algebra Introduction"],
    "Science": ["Micro-organisms","Food Preservation","Reproduction in Plants","Reproduction in Animals","Adolescence","Light – Reflection","Sound Waves","Synthetic Fibres","Metals and Non-metals","Conservation of Natural Resources"],
    "Social Studies": ["Resources and Development","Forest Resources","Water Resources","Agriculture","Mineral and Energy Resources","Manufacturing Industries","National Economy","Political Parties","Judiciary","Social Issues in India"],
    "Computer Science": ["Evolution of Computers","Software Types","Advanced Powerpoint","Introduction to Excel","Formulas in Excel","Internet Services","Cyberbullying","Scratch Advanced","Logic in Programming","Future Tech"]
  },
  6: {
    "Telugu": ["తెలుగు వ్యాకరణ విశేషాలు","ప్రాచీన సాహిత్యం","ఆధునిక కవిత్వం","నాటక కళ","అనువాద సాహిత్యం","జానపద కళలు","మీడియా అధ్యయనం","వ్యావహారిక తెలుగు","తెలంగాణ సాహిత్యం","సాహిత్య విమర్శ"],
    "Hindi": ["हिन्दी व्याकरण विशेष","प्राचीन साहित्य","आधुनिक कविता","नाटक कला","अनुवाद साहित्य","लोक साहित्य","मीडिया अध्ययन","व्यावहारिक हिन्दी","क्षेत्रीय साहित्य","साहित्य समालोचना"],
    "English": ["Advanced Grammar","Ancient Literature","Modern Poetry","Drama and Theatre","Translation Literature","Folk Literature","Media Studies","Practical English","Regional Literature","Literary Criticism"],
    "Maths": ["Knowing Our Numbers","Whole Numbers","Playing with Numbers","Basic Geometrical Ideas","Understanding Elementary Shapes","Integers","Fractions","Decimals","Data Handling","Mensuration – Perimeter and Area"],
    "Science": ["Food: Where Does It Come From","Components of Food","Fibre to Fabric","Sorting Materials into Groups","Separation of Substances","Changes Around Us","Getting to Know Plants","Body Movements","The Living Organisms","Motion and Measurement"],
    "Social Studies": ["The Earth in the Solar System","Globe – Latitudes and Longitudes","Motions of the Earth","Maps","Major Domains of the Earth","Major Landforms","Our Country India","India – Climate","Natural Vegetation and Wildlife","Our Changing Earth"],
    "Computer Science": ["Computer Architecture","Operating Systems","Advanced Excel Functions","Charts in Excel","Introduction to HTML","Web Page Design","Programming Concepts","Python Basics","Variables and Data Types","Digital Citizenship"]
  },
  7: {
    "Telugu": ["తెలుగు పద్య సంపద","శతక సాహిత్యం","ద్విపద కావ్యాలు","ప్రబంధ సాహిత్యం","వచన సాహిత్యం","హాస్య సాహిత్యం","భక్తి సాహిత్యం","సాహిత్య చరిత్ర","తెలుగు లిపి పరిణామం","ప్రముఖ కవులు"],
    "Hindi": ["हिन्दी पद्य संपदा","शतक साहित्य","द्विपद काव्य","प्रबंध साहित्य","गद्य साहित्य","हास्य साहित्य","भक्ति साहित्य","साहित्य इतिहास","भाषा का विकास","प्रमुख कवि"],
    "English": ["Poetry Anthology","Epic Literature","Heroic Couplets","Prose Literature","Humour in Literature","Devotional Literature","History of English","Language Evolution","Grammar – Advanced","Famous Authors"],
    "Maths": ["Integers","Fractions and Decimals","Data Handling","Simple Equations","Lines and Angles","The Triangle and its Properties","Congruence of Triangles","Comparing Quantities","Rational Numbers","Practical Geometry"],
    "Science": ["Nutrition in Plants","Nutrition in Animals","Fibre to Fabric","Heat","Acids Bases and Salts","Physical and Chemical Changes","Weather Climate and Adaptation","Winds Storms and Cyclones","Soil","Respiration in Organisms"],
    "Social Studies": ["Tracing Changes Through a Thousand Years","New Kings and Kingdoms","The Delhi Sultans","The Mughal Empire","Rulers and Buildings","Towns Traders and Craftspersons","Tribes Nomads and Settled Communities","Devotional Paths to the Divine","The Making of Regional Cultures","Eighteenth-Century Political Formations"],
    "Computer Science": ["Number Systems","Computer Networks","HTML Advanced","CSS Basics","Styling Web Pages","Python Control Structures","Loops in Python","Functions in Python","Database Concepts","Cyber Security"]
  },
  8: {
    "Telugu": ["తెలుగు గ్రంథాలు","కావ్య పరిచయం","అలంకార శాస్త్రం","ఛందస్సు","రస సిద్ధాంతం","భావ కవిత్వం","విమర్శ సాహిత్యం","సాహిత్య వ్యాస రచన","తెలుగు నవల","నాటక సాహిత్యం"],
    "Hindi": ["हिन्दी ग्रंथ","काव्य परिचय","अलंकार शास्त्र","छंद","रस सिद्धांत","भाव कविता","समालोचना","साहित्यिक निबंध","हिन्दी उपन्यास","नाटक साहित्य"],
    "English": ["Classic Novels","Poetry Analysis","Figures of Speech","Prosody","Theory of Rasa","Romantic Poetry","Literary Criticism","Essay Writing","The Novel Form","Modern Drama"],
    "Maths": ["Rational Numbers","Linear Equations in One Variable","Understanding Quadrilaterals","Practical Geometry","Data Handling","Squares and Square Roots","Cubes and Cube Roots","Comparing Quantities","Algebraic Expressions","Visualising Solid Shapes"],
    "Science": ["Crop Production and Management","Microorganisms","Synthetic Fibres and Plastics","Metals and Non-metals","Coal and Petroleum","Combustion and Flame","Conservation of Plants and Animals","Cell Structure and Functions","Reproduction in Animals","Reaching the Age of Adolescence"],
    "Social Studies": ["Resources","Land Soil Water Natural Vegetation and Wildlife","Mineral and Power Resources","Agriculture","Industries","Human Resources","How When and Where","From Trade to Territory","Ruling the Countryside","Tribals Dikus and the Vision of a Golden Age"],
    "Computer Science": ["Network Topology","Introduction to DBMS","SQL Basics","Queries in SQL","Python Data Structures","Lists and Dictionaries","File Handling in Python","App Development Basics","AI Introduction","IT and Society"]
  },
  9: {
    "Telugu": ["తెలుగు కవిత్వ పరిణామం","ప్రాచీన కావ్యాలు","ఆధునిక నవల","కథా సాహిత్యం","నాటక కళ చరిత్ర","సాహిత్య సిద్ధాంతాలు","వ్యాకరణ సూక్ష్మాలు","రచన నైపుణ్యం","సాహిత్య సమీక్ష","తెలుగు పత్రికా చరిత్ర"],
    "Hindi": ["हिन्दी काव्य परिणाम","प्राचीन काव्य","आधुनिक उपन्यास","कथा साहित्य","नाटक कला इतिहास","साहित्य सिद्धांत","व्याकरण सूक्ष्मता","लेखन कौशल","साहित्य समीक्षा","हिन्दी पत्रकारिता इतिहास"],
    "English": ["Evolution of English Poetry","Classical Literature","The Modern Novel","Short Story","History of Drama","Literary Theories","Grammar Nuances","Writing Skills","Literary Review","History of Journalism"],
    "Maths": ["Number Systems","Polynomials","Coordinate Geometry","Linear Equations in Two Variables","Introduction to Euclid's Geometry","Lines and Angles","Triangles","Quadrilaterals","Areas of Parallelograms and Triangles","Circles"],
    "Science": ["Matter in Our Surroundings","Is Matter Around Us Pure","Atoms and Molecules","Structure of the Atom","The Fundamental Unit of Life – Cell","Tissues","Diversity in Living Organisms","Motion","Force and Newton's Laws","Gravitation"],
    "Social Studies": ["The French Revolution","Socialism in Europe and the Russian Revolution","Nazism and the Rise of Hitler","Forest Society and Colonialism","Pastoralists in the Modern World","India – Size and Location","Physical Features of India","Drainage","Climate","Natural Vegetation and Wildlife"],
    "Computer Science": ["Basics of Information Technology","Operating System Overview","Word Processing Advanced","Spreadsheet Advanced","Digital Presentation Advanced","Python Modules","String Manipulation","Exception Handling","Web Applications","Cyber Ethics"]
  },
  10: {
    "Telugu": ["తెలుగు మహాకవులు","శ్రీనాథుని కావ్యాలు","పోతన భాగవతం","వేమన శతకం","ఆధునిక తెలుగు కవిత్వం","గురజాడ రచనలు","శ్రీశ్రీ కవిత్వం","తెలుగు నాటకాలు","తెలుగు నవలా సాహిత్యం","సాహిత్య పురస్కారాలు"],
    "Hindi": ["हिन्दी महाकवि","तुलसीदास रचनाएँ","कबीर दोहे","मीराबाई भजन","आधुनिक हिन्दी कविता","प्रेमचंद की रचनाएँ","महादेवी वर्मा","हिन्दी नाटक","हिन्दी उपन्यास साहित्य","साहित्य पुरस्कार"],
    "English": ["Shakespeare – Selected Works","Romantic Poets","Victorian Literature","20th Century Prose","Post-Colonial Literature","American Literature","World Literature","Comparative Literature","Grammar – Advanced","Preparing for Competitive Exams"],
    "Maths": ["Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Applications of Trigonometry","Circles"],
    "Science": ["Chemical Reactions and Equations","Acids Bases and Salts","Metals and Non-metals","Carbon and its Compounds","Periodic Classification of Elements","Life Processes","Control and Coordination","How Do Organisms Reproduce","Heredity and Evolution","Light – Reflection and Refraction"],
    "Social Studies": ["The Rise of Nationalism in Europe","Nationalism in India","The Making of a Global World","The Age of Industrialisation","Print Culture and the Modern World","Resources and Development","Forest and Wildlife Resources","Water Resources","Agriculture","Minerals and Energy Resources"],
    "Computer Science": ["Internet Protocols","Web Services","HTML Forms","CSS Layouts","Introduction to Javascript","JS Functions and Events","Python OOP Basics","Classes and Objects","Societal Impacts of IT","Data Privacy"]
  }
}

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for class_num, subjects in CURRICULUM.items():
            for subject, chapters in subjects.items():
                for i, chapter_name in enumerate(chapters):
                    chapter = Chapter(
                        class_number=class_num,
                        subject=subject,
                        chapter_number=i + 1,
                        chapter_name=chapter_name
                    )
                    session.add(chapter)
        
        await session.commit()
        print("Successfully seeded 700 chapters.")

if __name__ == "__main__":
    asyncio.run(seed())
