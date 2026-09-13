const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Team = require("./models/Team");
const Player = require("./models/Player");
const Match = require("./models/Match");
const Competition = require("./models/Competition");
const News = require("./models/News");
const Injury = require("./models/Injury");
const Training = require("./models/Training");
const Report = require("./models/Report");
const Staff = require("./models/Staff");
const Transfer = require("./models/Transfer");
const Contract = require("./models/Contract");
const Stadium = require("./models/Stadium");
const Activity = require("./models/Activity");

function photo(name, bg = "0E3B2E") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=E4CD8A&size=256&bold=true`;
}

function p(id, firstName, lastName, dob, position, teamId, jersey, extra = {}) {
  const displayName = `${firstName} ${lastName}`;
  return {
    id,
    firstName,
    lastName,
    displayName,
    name: displayName,
    photo: photo(displayName, extra.bg),
    dob,
    nationality: extra.nationality || "Nepal",
    countryOfBirth: extra.countryOfBirth || "Nepal",
    height: extra.height || 176 + (jersey % 10),
    weight: extra.weight || 70 + (jersey % 8),
    preferredFoot: extra.foot || "Right",
    position,
    secondaryPosition: extra.secondary || "",
    jersey,
    teamId,
    squad: extra.squad || "First Team",
    status: extra.status || "Active",
    dateJoined: extra.joined || "2023-07-01",
    contractStart: extra.cs || "2024-07-01",
    contractEnd: extra.ce || "2027-06-30",
    contractStatus: extra.contractStatus || "Active",
  };
}

const demo = {
  stadiums: [
    { id: "sd1", name: "Sindhuli Stadium", location: "Sindhulimadi", capacity: 8500 },
    { id: "sd2", name: "Kamalamai Ground", location: "Kamalamai", capacity: 4200 },
    { id: "sd3", name: "Dudhauli Arena", location: "Dudhauli", capacity: 3000 },
    { id: "sd4", name: "Marin Field", location: "Marin", capacity: 2500 },
  ],
  teams: [
    { id: "t1", name: "Sindhuli FC", shortName: "SFC", location: "Sindhulimadi", stadium: "Sindhuli Stadium", stadiumId: "sd1", coach: "Bikash Thapa", founded: 2012, status: "Active", colors: ["#0E3B2E", "#C7A344"], contactEmail: "club@sindhulifc.np" },
    { id: "t2", name: "Kamalamai United", shortName: "KMU", location: "Kamalamai", stadium: "Kamalamai Ground", stadiumId: "sd2", coach: "Raju Karki", founded: 2015, status: "Active", colors: ["#1E7245", "#F5F2E8"] },
    { id: "t3", name: "Dudhauli Warriors", shortName: "DWA", location: "Dudhauli", stadium: "Dudhauli Arena", stadiumId: "sd3", coach: "Suman Lama", founded: 2016, status: "Active" },
    { id: "t4", name: "Marin FC", shortName: "MFC", location: "Marin", stadium: "Marin Field", stadiumId: "sd4", coach: "Anil Bista", founded: 2014, status: "Active" },
    { id: "t5", name: "Sunkoshi FC", shortName: "SKC", location: "Sunkoshi", stadium: "Sunkoshi Park", coach: "Prakash Rai", founded: 2018, status: "Active" },
    { id: "t6", name: "Hariharpurgadhi FC", shortName: "HFC", location: "Hariharpur", stadium: "Gadhi Ground", coach: "Dipak Dahal", founded: 2017, status: "Active" },
  ],
};

demo.players = [
  p("p1", "Niraj", "Karki", "2000-01-25", "Goalkeeper", "t1", 1, { height: 185, weight: 80 }),
  p("p2", "Sagar", "Adhikari", "2001-06-11", "Defender", "t1", 3),
  p("p3", "Bishal", "Rai", "1999-11-03", "Defender", "t1", 4, { height: 182, weight: 78 }),
  p("p4", "Hari", "Basnet", "1998-08-19", "Defender", "t1", 5),
  p("p5", "Prakash", "Tamang", "2002-02-02", "Defender", "t1", 2),
  p("p6", "Ramesh", "Poudel", "2000-09-09", "Midfielder", "t1", 6),
  p("p7", "Nabin", "Magar", "2003-04-21", "Midfielder", "t1", 7),
  p("p8", "Sujan", "Magar", "2002-07-19", "Midfielder", "t1", 8, { height: 175, weight: 70, ce: "2026-10-15" }),
  p("p9", "Aarav", "Shrestha", "2001-04-12", "Forward", "t1", 9, { height: 178, weight: 72, secondary: "Winger" }),
  p("p10", "Dipesh", "Khatri", "2001-12-05", "Midfielder", "t1", 10),
  p("p11", "Anish", "Thapa", "2004-03-17", "Forward", "t1", 11),
  p("p12", "Gopal", "Shrestha", "1997-05-30", "Midfielder", "t1", 12),
  p("p13", "Milan", "BK", "2003-10-08", "Forward", "t1", 14),
  p("p14", "Tek", "Bahadur", "1999-01-14", "Defender", "t1", 16),

  p("p15", "Ujjwal", "KC", "1999-02-11", "Goalkeeper", "t2", 1, { bg: "1E7245" }),
  p("p16", "Santosh", "Rai", "2000-07-07", "Defender", "t2", 2, { bg: "1E7245" }),
  p("p17", "Bikram", "Ale", "1998-11-22", "Defender", "t2", 4, { bg: "1E7245" }),
  p("p18", "Himal", "Gurung", "2001-03-03", "Defender", "t2", 5, { bg: "1E7245" }),
  p("p19", "Roshan", "Karki", "2002-09-18", "Defender", "t2", 3, { bg: "1E7245" }),
  p("p20", "Sanjay", "Lama", "1998-03-08", "Midfielder", "t2", 7, { bg: "1E7245" }),
  p("p21", "Kishor", "Maharjan", "2000-06-26", "Midfielder", "t2", 8, { bg: "1E7245" }),
  p("p22", "Rohan", "Thapa", "2001-09-14", "Forward", "t2", 10, { bg: "1E7245", height: 180 }),
  p("p23", "Aayush", "Shahi", "2003-01-29", "Forward", "t2", 9, { bg: "1E7245" }),
  p("p24", "Nischal", "Dahal", "2002-12-12", "Midfielder", "t2", 6, { bg: "1E7245" }),
  p("p25", "Bishal", "Tamang", "2004-08-04", "Forward", "t2", 11, { bg: "1E7245" }),

  p("p26", "Kiran", "Bista", "2003-05-22", "Forward", "t3", 11, { bg: "5B3E31" }),
  p("p27", "Suman", "Karki", "2000-04-04", "Midfielder", "t3", 8, { bg: "5B3E31" }),
  p("p28", "Arjun", "Magar", "1999-09-09", "Defender", "t3", 4, { bg: "5B3E31" }),
  p("p29", "Deepak", "Rai", "2001-01-21", "Goalkeeper", "t3", 1, { bg: "5B3E31" }),
  p("p30", "Binod", "Shrestha", "2002-11-11", "Midfielder", "t3", 6, { bg: "5B3E31" }),
  p("p31", "Yogesh", "Lama", "2004-06-06", "Forward", "t3", 9, { bg: "5B3E31" }),

  p("p32", "Deepak", "Gurung", "1997-12-11", "Defender", "t4", 5, { status: "Injured", bg: "2A5D8A" }),
  p("p33", "Santosh", "Bista", "2001-08-08", "Forward", "t4", 9, { bg: "2A5D8A" }),
  p("p34", "Kamal", "Thapa", "2000-02-14", "Midfielder", "t4", 8, { bg: "2A5D8A" }),
  p("p35", "Raju", "Ale", "1999-10-10", "Goalkeeper", "t4", 1, { bg: "2A5D8A" }),
  p("p36", "Suresh", "Dahal", "2003-07-27", "Defender", "t4", 3, { bg: "2A5D8A" }),

  p("p37", "Manoj", "Dahal", "2002-02-18", "Midfielder", "t5", 6, { bg: "A6372B" }),
  p("p38", "Pawan", "Karki", "2001-05-05", "Forward", "t5", 10, { bg: "A6372B" }),
  p("p39", "Laxman", "Rai", "1998-12-01", "Defender", "t5", 4, { bg: "A6372B" }),
  p("p40", "Ganesh", "Magar", "2000-03-23", "Goalkeeper", "t5", 1, { bg: "A6372B" }),

  p("p41", "Umesh", "Yadav", "1999-08-30", "Goalkeeper", "t6", 1, { bg: "134A38" }),
  p("p42", "Dinesh", "Shrestha", "2002-04-16", "Forward", "t6", 9, { bg: "134A38" }),
  p("p43", "Bikash", "Tamang", "2001-07-07", "Midfielder", "t6", 8, { bg: "134A38" }),
  p("p44", "Nabin", "Basnet", "2003-09-19", "Defender", "t6", 5, { bg: "134A38" }),
];

demo.competitions = [
  {
    id: "c1",
    name: "Sindhuli District League",
    shortName: "SDL",
    season: "2025/26",
    type: "League",
    description: "The premier district league for clubs across Sindhuli, Nepal.",
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    teamIds: ["t1", "t2", "t3", "t4", "t5", "t6"],
    status: "Active",
    logo: photo("SDL", "C7A344"),
  },
  {
    id: "c2",
    name: "Marin Cup",
    shortName: "MC",
    season: "2025/26",
    type: "Cup",
    description: "Knockout cup for community clubs along the Marin corridor.",
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    teamIds: ["t1", "t4", "t5"],
    status: "Active",
  },
];

demo.matches = [
  {
    id: "m1",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t1",
    awayTeamId: "t2",
    date: "2026-08-22",
    time: "15:00",
    stadium: "Sindhuli Stadium",
    referee: "Ramesh KC",
    assistantReferee1: "Gopal Lama",
    assistantReferee2: "Sita Rai",
    varOfficial: "Hari Prasad",
    status: "Finished",
    homeScore: 2,
    awayScore: 1,
    events: [
      { id: "e1", minute: 23, type: "goal", teamId: "t1", playerId: "p9", scorerId: "p9", assistId: "p8", goalType: "Open Play" },
      { id: "e2", minute: 41, type: "yellow", teamId: "t2", playerId: "p17", scorerId: "p17", reason: "Tactical foul" },
      { id: "e3", minute: 63, type: "sub", teamId: "t1", playerOffId: "p11", playerOnId: "p13" },
      { id: "e4", minute: 67, type: "goal", teamId: "t2", playerId: "p22", scorerId: "p22", assistId: "p20", goalType: "Open Play" },
      { id: "e5", minute: 81, type: "goal", teamId: "t1", playerId: "p9", scorerId: "p9", assistId: "p10", goalType: "Open Play" },
    ],
    lineups: {
      home: { formation: "4-3-3", startingXI: ["p1", "p5", "p3", "p4", "p2", "p6", "p8", "p10", "p7", "p9", "p11"], substitutes: ["p12", "p13", "p14"] },
      away: { formation: "4-4-2", startingXI: ["p15", "p16", "p17", "p18", "p19", "p20", "p21", "p24", "p25", "p22", "p23"], substitutes: [] },
    },
    stats: { possessionHome: 54, possessionAway: 46, shotsHome: 14, shotsAway: 9, shotsOnTargetHome: 6, shotsOnTargetAway: 4, cornersHome: 5, cornersAway: 3, foulsHome: 12, foulsAway: 14, offsidesHome: 2, offsidesAway: 1, passAccuracyHome: 82, passAccuracyAway: 78 },
  },
  {
    id: "m2",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t3",
    awayTeamId: "t4",
    date: "2026-08-24",
    time: "15:00",
    stadium: "Dudhauli Arena",
    referee: "Suresh Lama",
    assistantReferee1: "Ram Bahadur",
    assistantReferee2: "Maya Shrestha",
    status: "Finished",
    homeScore: 0,
    awayScore: 0,
    events: [{ id: "e6", minute: 78, type: "yellow", teamId: "t4", playerId: "p34", scorerId: "p34" }],
    lineups: { home: { formation: "4-2-3-1", startingXI: ["p29", "p28", "p27", "p26", "p30", "p31"] }, away: { formation: "5-3-2", startingXI: ["p35", "p32", "p36", "p34", "p33"] } },
    stats: { possessionHome: 50, possessionAway: 50, shotsHome: 8, shotsAway: 8, shotsOnTargetHome: 2, shotsOnTargetAway: 3, cornersHome: 4, cornersAway: 4, foulsHome: 10, foulsAway: 11, offsidesHome: 1, offsidesAway: 2, passAccuracyHome: 74, passAccuracyAway: 71 },
  },
  {
    id: "m3",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t5",
    awayTeamId: "t6",
    date: "2026-08-29",
    time: "14:30",
    stadium: "Sunkoshi Park",
    referee: "Bimal Adhikari",
    status: "Finished",
    homeScore: 1,
    awayScore: 2,
    events: [
      { id: "e7", minute: 12, type: "goal", teamId: "t6", playerId: "p42", scorerId: "p42", goalType: "Penalty" },
      { id: "e8", minute: 55, type: "goal", teamId: "t5", playerId: "p38", scorerId: "p38", assistId: "p37", goalType: "Free Kick" },
      { id: "e9", minute: 88, type: "goal", teamId: "t6", playerId: "p43", scorerId: "p43", assistId: "p42", goalType: "Open Play" },
    ],
    lineups: { home: { formation: "4-4-2", startingXI: ["p40", "p39", "p37", "p38"] }, away: { formation: "4-3-3", startingXI: ["p41", "p44", "p43", "p42"] } },
    stats: { possessionHome: 47, possessionAway: 53, shotsHome: 10, shotsAway: 12, shotsOnTargetHome: 4, shotsOnTargetAway: 6, cornersHome: 3, cornersAway: 6, foulsHome: 13, foulsAway: 9, offsidesHome: 0, offsidesAway: 3, passAccuracyHome: 70, passAccuracyAway: 76 },
  },
  {
    id: "m4",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t1",
    awayTeamId: "t3",
    date: "2026-09-05",
    time: "15:00",
    stadium: "Sindhuli Stadium",
    referee: "Ramesh KC",
    status: "Finished",
    homeScore: 3,
    awayScore: 1,
    events: [
      { id: "e10", minute: 9, type: "goal", teamId: "t1", playerId: "p9", scorerId: "p9", assistId: "p11", goalType: "Open Play" },
      { id: "e11", minute: 34, type: "goal", teamId: "t3", playerId: "p26", scorerId: "p26", goalType: "Open Play" },
      { id: "e12", minute: 61, type: "goal", teamId: "t1", playerId: "p10", scorerId: "p10", assistId: "p8", goalType: "Open Play" },
      { id: "e13", minute: 90, extra: 2, type: "goal", teamId: "t1", playerId: "p13", scorerId: "p13", goalType: "Open Play" },
    ],
    lineups: {
      home: { formation: "4-3-3", startingXI: ["p1", "p5", "p3", "p4", "p2", "p6", "p8", "p10", "p7", "p9", "p11"], substitutes: ["p13"] },
      away: { formation: "4-4-2", startingXI: ["p29", "p28", "p27", "p30", "p26", "p31"] },
    },
    stats: { possessionHome: 61, possessionAway: 39, shotsHome: 18, shotsAway: 7, shotsOnTargetHome: 9, shotsOnTargetAway: 3, cornersHome: 8, cornersAway: 2, foulsHome: 8, foulsAway: 12, offsidesHome: 3, offsidesAway: 1, passAccuracyHome: 86, passAccuracyAway: 69 },
  },
  {
    id: "m5",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t2",
    awayTeamId: "t5",
    date: "2026-09-13",
    time: "16:00",
    stadium: "Kamalamai Ground",
    referee: "Anita Shrestha",
    status: "Live",
    homeScore: 1,
    awayScore: 0,
    events: [{ id: "e14", minute: 27, type: "goal", teamId: "t2", playerId: "p22", scorerId: "p22", assistId: "p21", goalType: "Open Play" }],
    lineups: { home: { formation: "4-2-3-1", startingXI: ["p15", "p16", "p17", "p18", "p19", "p24", "p21", "p20", "p25", "p23", "p22"] }, away: { formation: "4-4-2", startingXI: ["p40", "p39", "p37", "p38"] } },
    stats: { possessionHome: 58, possessionAway: 42, shotsHome: 7, shotsAway: 3, shotsOnTargetHome: 3, shotsOnTargetAway: 1, cornersHome: 4, cornersAway: 1, foulsHome: 6, foulsAway: 8, offsidesHome: 1, offsidesAway: 0, passAccuracyHome: 80, passAccuracyAway: 72 },
  },
  {
    id: "m6",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t1",
    awayTeamId: "t6",
    date: "2026-09-20",
    time: "15:00",
    stadium: "Sindhuli Stadium",
    referee: "Ramesh KC",
    status: "Scheduled",
    homeScore: 0,
    awayScore: 0,
    events: [],
    lineups: { home: { formation: "4-3-3", startingXI: [], substitutes: [] }, away: { formation: "4-4-2", startingXI: [], substitutes: [] } },
    stats: { possessionHome: 50, possessionAway: 50, shotsHome: 0, shotsAway: 0, shotsOnTargetHome: 0, shotsOnTargetAway: 0, cornersHome: 0, cornersAway: 0, foulsHome: 0, foulsAway: 0, offsidesHome: 0, offsidesAway: 0, passAccuracyHome: 0, passAccuracyAway: 0 },
  },
  {
    id: "m7",
    compId: "c1",
    season: "2025/26",
    homeTeamId: "t4",
    awayTeamId: "t2",
    date: "2026-09-27",
    time: "14:00",
    stadium: "Marin Field",
    referee: "TBD",
    status: "Scheduled",
    homeScore: 0,
    awayScore: 0,
    events: [],
    lineups: { home: { formation: "3-5-2" }, away: { formation: "4-3-3" } },
    stats: {},
  },
  {
    id: "m8",
    compId: "c2",
    season: "2025/26",
    homeTeamId: "t1",
    awayTeamId: "t4",
    date: "2026-10-04",
    time: "15:30",
    stadium: "Sindhuli Stadium",
    referee: "TBD",
    status: "Scheduled",
    homeScore: 0,
    awayScore: 0,
    events: [],
    lineups: { home: { formation: "4-3-3" }, away: { formation: "5-3-2" } },
    stats: {},
  },
];

demo.news = [
  {
    id: "n1",
    title: "Sindhuli FC seize control with a 2–1 derby win",
    category: "Match",
    author: "Sports Desk",
    date: "2026-08-23",
    status: "Published",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1400&q=80",
    excerpt: "Aarav Shrestha scored twice as Sindhuli FC beat Kamalamai United in front of a packed Sindhuli Stadium.",
    content: "Sindhuli FC secured a crucial 2-1 victory over Kamalamai United with Aarav Shrestha scoring a brace. The atmosphere at Sindhuli Stadium was electric, with drums from the east terrace carrying through the second-half winner. Manager Bikash Thapa praised the midfield control of Sujan Magar, whose assist opened the scoring in the 23rd minute.",
  },
  {
    id: "n2",
    title: "Young Marin talent catching district eyes",
    category: "Player",
    author: "Anita Rai",
    date: "2026-08-26",
    status: "Published",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80",
    excerpt: "A new wave of players from Marin and Sunkoshi is shaping the 2025/26 season.",
    content: "Young players from Marin and Sunkoshi are showing real promise this season. Scouts from district clubs have been present at midweek training, and several youth prospects are already training with first-team squads.",
  },
  {
    id: "n3",
    title: "Dudhauli Warriors hold Marin FC to a stalemate",
    category: "Match",
    author: "Sports Desk",
    date: "2026-08-25",
    status: "Published",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=80",
    excerpt: "A defensive masterclass ended goalless at Dudhauli Arena.",
    content: "A defensive masterclass from both sides ended in a goalless draw at Dudhauli Arena. Goalkeepers Deepak Rai and Raju Ale were outstanding, and the result keeps both clubs in the mix for a top-four finish.",
  },
  {
    id: "n4",
    title: "Community pitch project opens in Tinpatan",
    category: "Community",
    author: "Clubhouse Desk",
    date: "2026-09-02",
    status: "Published",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80",
    excerpt: "A new community ground gives more children a place to play football in Sindhuli.",
    content: "Local coaches and municipality partners opened a new community pitch in Tinpatan. Evening sessions will be free for schoolchildren twice a week, with Sindhuli FC players visiting once a month.",
  },
];

demo.injuries = [
  { id: "inj1", playerId: "p32", type: "Ankle sprain", date: "2026-08-20", expectedReturn: "2026-10-01", status: "Injured", medicalNotes: "Grade 2 lateral sprain. Avoid cutting work for three weeks. Private physio plan stored with medical staff." },
  { id: "inj2", playerId: "p8", type: "Hamstring tightness", date: "2026-09-08", expectedReturn: "2026-09-18", status: "Recovering", medicalNotes: "Mild tightness after extra-time running. Load management only." },
];

demo.training = [
  { id: "tr1", date: "2026-09-15", time: "07:00", type: "Tactical", duration: 90, coach: "Bikash Thapa", teamId: "t1", notes: "Pressing triggers and set-piece routines.", attendance: [{ playerId: "p9", status: "Present" }, { playerId: "p8", status: "Excused" }, { playerId: "p1", status: "Present" }] },
  { id: "tr2", date: "2026-09-16", time: "16:30", type: "Fitness", duration: 75, coach: "Raju Karki", teamId: "t2", notes: "High-intensity intervals.", attendance: [] },
];

demo.staff = [
  { id: "st1", name: "Bikash Thapa", role: "Manager", nationality: "Nepal", teamId: "t1", joinDate: "2021-01-12", email: "bikash@sindhulifc.np", phone: "+977-980000001", photo: photo("Bikash Thapa") },
  { id: "st2", name: "Maya Gurung", role: "Physiotherapist", nationality: "Nepal", teamId: "t1", joinDate: "2023-03-01", email: "maya@sindhulifc.np", photo: photo("Maya Gurung") },
  { id: "st3", name: "Raju Karki", role: "Coach", nationality: "Nepal", teamId: "t2", joinDate: "2022-06-01", photo: photo("Raju Karki", "1E7245") },
  { id: "st4", name: "Suman Lama", role: "Assistant Coach", nationality: "Nepal", teamId: "t3", joinDate: "2024-01-10", photo: photo("Suman Lama", "5B3E31") },
  { id: "st5", name: "Dr. Nisha Adhikari", role: "Medical Staff", nationality: "Nepal", teamId: "t1", joinDate: "2022-11-04", photo: photo("Nisha Adhikari") },
];

demo.transfers = [
  { id: "tf1", playerId: "p13", previousTeamId: "t5", newTeamId: "t1", type: "Permanent", date: "2026-07-12", fee: "NPR 150,000", contractExpiry: "2028-06-30" },
];

demo.contracts = [
  { id: "ct1", playerId: "p8", teamId: "t1", start: "2024-07-01", end: "2026-10-15", status: "Expiring" },
  { id: "ct2", playerId: "p9", teamId: "t1", start: "2024-07-01", end: "2027-06-30", status: "Active" },
  { id: "ct3", playerId: "p22", teamId: "t2", start: "2025-01-01", end: "2026-10-30", status: "Expiring" },
];

demo.reports = [
  { id: "r1", name: "Kiran Magar", email: "kiran.fan@gmail.com", phone: "9841000001", subject: "Kick-off time for Marin fixture", message: "Please confirm if the Marin FC match on 27 Sep still starts at 14:00. Fans from the west ridge need extra travel time.", category: "Match Report", status: "New" },
  { id: "r2", name: "Sita Basnet", email: "sita.b@example.com", subject: "Player name spelling", message: "The directory shows Manoj Dahal but local programmes spell it Manoj Dahal Magar. Can you check?", category: "Correction Request", status: "New" },
  { id: "r3", name: "Hari Prasad", email: "hari@kamalamai.np", subject: "Great coverage", message: "The live match centre is excellent. Thank you for covering district football properly.", category: "Community Feedback", status: "In Review", managerNotes: "Send a thank-you reply this week." },
  { id: "r4", name: "Anonymous supporter", email: "fan@sindhuli.np", subject: "Website image loading slowly", message: "News images took a long time on mobile last night.", category: "Website Issue", status: "New" },
];

demo.activity = [
  { message: "Player added: Aarav Shrestha", type: "player", actor: "System" },
  { message: "Match result updated", type: "match", actor: "System" },
  { message: "News published: Sindhuli FC seize control with a 2–1 derby win", type: "news", actor: "System" },
  { message: "Report received", type: "report", actor: "System" },
];

async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "admin@sindhulifc.local").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || "admin12345";
  const name = process.env.ADMIN_NAME || "Club Manager";
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  const hashed = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email }).select("+password");
  if (existing) {
    if (!["super_admin", "admin", "manager", "coach", "medical", "staff"].includes(existing.role)) {
      existing.role = "super_admin";
      await existing.save();
    }
    return existing;
  }
  return User.create({
    name,
    email,
    password: hashed,
    role: "super_admin",
    displayName: name,
    username: email,
  });
}

async function seedFootball(force = false) {
  if (!force && (await Team.countDocuments()) > 0) return { seeded: false };
  const collections = [Team, Player, Match, Competition, News, Injury, Training, Report, Staff, Transfer, Contract, Stadium, Activity];
  if (force) {
    await Promise.all(collections.map((M) => M.deleteMany({})));
  }
  await Stadium.insertMany(demo.stadiums);
  await Team.insertMany(demo.teams);
  await Player.insertMany(demo.players);
  await Competition.insertMany(demo.competitions);
  await Match.insertMany(demo.matches);
  await News.insertMany(demo.news);
  await Injury.insertMany(demo.injuries);
  await Training.insertMany(demo.training);
  await Staff.insertMany(demo.staff);
  await Transfer.insertMany(demo.transfers);
  await Contract.insertMany(demo.contracts);
  await Report.insertMany(demo.reports);
  await Activity.insertMany(demo.activity);
  return { seeded: true };
}

async function seedIfEmpty() {
  await ensureAdmin();
  return seedFootball(false);
}

module.exports = { seedIfEmpty, seedFootball, ensureAdmin, demo };
