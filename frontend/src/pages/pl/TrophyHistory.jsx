import { useNavigate } from "react-router-dom";

export default function TrophyHistory() {

    const navigate = useNavigate();

    const winners = [

        {
            season: "2024/25",
            club: "Liverpool",
            crest: "https://crests.football-data.org/64.png",
            color: "from-red-500/30 to-red-900/10"
        },

        {
            season: "2023/24",
            club: "Manchester City",
            crest: "https://crests.football-data.org/65.png",
            color: "from-sky-500/30 to-sky-900/10"
        },

        {
            season: "2022/23",
            club: "Manchester City",
            crest: "https://crests.football-data.org/65.png",
            color: "from-sky-500/30 to-sky-900/10"
        },

        {
            season: "2021/22",
            club: "Manchester City",
            crest: "https://crests.football-data.org/65.png",
            color: "from-sky-500/30 to-sky-900/10"
        },

        {
            season: "2020/21",
            club: "Manchester City",
            crest: "https://crests.football-data.org/65.png",
            color: "from-sky-500/30 to-sky-900/10"
        }

    ];

    return (

<section className="mb-20">

<div className="flex items-center justify-between mb-8">

<div>

<div className="uppercase tracking-[5px] text-purple-400 text-sm">

History

</div>

<h2 className="text-5xl font-black text-white">

Premier League Champions

</h2>

</div>

<button

onClick={()=>navigate("/pl/history")}

className="text-purple-400 hover:text-white"

>

View All →

</button>

</div>

<div className="relative">

{/* Timeline */}

<div className="absolute top-20 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500"/>

<div className="grid lg:grid-cols-5 gap-8 relative">

{winners.map((club,index)=>(

<div

key={club.season}

className="group text-center"

>

<div className="relative">

<div className="
absolute
left-1/2
-top-2
-translate-x-1/2
w-6
h-6
rounded-full
bg-purple-500
border-4
border-[#090B16]
z-20
"/>

<div className={`
mt-10
rounded-[28px]
bg-gradient-to-br
${club.color}
border
border-white/10
backdrop-blur-xl
p-6
hover:-translate-y-3
transition-all
duration-300
`}>

<img

src={club.crest}

className="w-20 h-20 mx-auto object-contain drop-shadow-2xl"

/>

<h3 className="text-white font-black text-2xl mt-5">

{club.club}

</h3>

<p className="text-gray-400 mt-2">

Premier League Winner

</p>

<div className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-purple-300">

🏆 {club.season}

</div>

</div>

</div>

</div>

))}

</div>

</div>

</section>

    );

}