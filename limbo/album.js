// LIMBO (2024), the game-album by LEFT.: its words, the calls and their choices, and who made each track.
// To change a line: each one is the Portuguese, then " | ", then the English. An empty line starts a new verse.
// vibe is the look of a track's screen (its colours and its scene), defined in index.html. A call's caller is the
// name its phone shows; voice is who speaks it, as in its credits. Its chat is what the voice says, as messages
// shown one at a time, each line "from-to | Portuguese | English" in seconds of the track, and at "choose" the
// messages go and only the choice stays; a call without one shows its question until it ends. The question is
// also the recap's.
// The words come from "LIMBO - Letras", "LIMBO - Tracklist" and "Limbo - Ficha técnica" in Google Drive,
// and "Volto a ti - Letra" (2023). The English is Claude's translation, for António to check.
window.LIMBO = {
  spotify: 'https://open.spotify.com/album/6DkuX5UAticvTx5NxEFVH5',
  // How many of "the souls in Limbo" took each song after its call, in percent: made up, for the recap at the end
  // (each pair adds up to 100). Your ending's share is these five multiplied.
  souls: { 3: 64, 4: 36, 7: 41, 6: 59, 9: 55, 10: 45, 12: 38, 13: 62, 15: 47, 16: 53 },

  // The name of your ending, from your choices: the second call says who you are, the third where, and the other
  // three give a trait each. Each is [Portuguese, English]; 2 x 2 x 2 x 2 x 2 = 32, one for each way through.
  ending: {
    who: { 7: ['O Ex', 'The Ex'], 6: ['O Romântico', 'The Romantic'] },
    where: { 9: ['da Estrada', 'on the Road'], 10: ['da Pista', 'on the Dancefloor'] },
    traits: {
      3: ['Otimista', 'Optimist'], 4: ['Furioso', 'Furious'],
      12: ['Insaciável', 'Insatiable'], 13: ['Zen', 'Zen'],
      15: ['Honesto', 'Honest'], 16: ['Lavado em lágrimas', 'Cried it out'],
    },
  },

  // The story so far, told by the game's system after each track, before the next call, one line per track of your
  // path, added up. A song's line depends on the choice before it ("3>6": Pulso after Siga), so the stakes add up.
  // [Portuguese, English]. errors: what the failing system adds, more and more towards the end
  story: {
    1: ['Entraste no jogo. Dizem que ninguém ganha.', 'You entered the game. They say nobody wins.'],
    3: ['Levantaste a cabeça e seguiste em frente. Voltaste a sentir o sol na cara.', 'You lifted your head and moved on. You feel the sun on your face again.'],
    4: ['Perdeste a cabeça. Não dormiste, e rebentaste com tudo à tua volta.', 'You lost your head. No sleep, and everything around you blown up.'],
    '3>6': ['De cabeça erguida, ficaste com ela. Ao lado dela, o pulso ainda dispara.', 'Head held high, you stayed with her. Beside her, your pulse still races.'],
    '4>6': ['Partiste tudo, e ela ficou na mesma. Tu também. O pulso ainda dispara.', 'You broke everything, and she stayed anyway. So did you. Your pulse still races.'],
    '3>7': ['Seguir em frente queria dizer acabar. Acabaste, voltaste, acabaste outra vez. Passaram anos, e não resultou.', 'Moving on meant ending it. You ended it, went back, ended it again. Years went by, and it didn’t work.'],
    '4>7': ['Acabaste com ela no meio da raiva. Tentaram outra vez, vezes sem conta, mas no fim não resultou.', 'You ended it in the middle of the anger. You tried again, over and over, but in the end it didn’t work.'],
    '6>9': ['Com ela ao lado, saíste de Lisboa pela A1. Na estrada, só vocês os dois.', 'With her beside you, you left Lisbon on the A1. On the road, just the two of you.'],
    '7>9': ['Depois de tantas voltas com ela, precisavas de ar: saíste de Lisboa pela A1, só tu e um amigo.', 'After so much back and forth with her, you needed air: you left Lisbon on the A1, just you and a friend.'],
    '6>10': ['Ficaste em Lisboa e foste dançar. Ela foi contigo, e a lua pairava por cima do Tejo.', 'You stayed in Lisbon and went dancing. She came along, and the moon hung over the Tejo.'],
    '7>10': ['Já sem ela, de vez, foste dançar até não te aguentares de pé.', 'Done with her for good, you went dancing until you couldn’t stand.'],
    '9>12': ['A estrada não chegou. Quiseste mais: mais longe, mais dinheiro, mais tudo.', 'The road wasn’t enough. You wanted more: further, more money, more of everything.'],
    '10>12': ['A pista não chegou. Quiseste mais: mais noites, mais coisas, mais tudo.', 'The dancefloor wasn’t enough. You wanted more: more nights, more things, more of everything.'],
    '9>13': ['No fim da estrada, paraste. Ficaste com o que tens, em silêncio.', 'At the end of the road, you stopped. You kept what you have, in silence.'],
    '10>13': ['Depois da pista, o silêncio. Ficaste com o que tens, e chegou.', 'After the dancefloor, silence. You kept what you have, and it was enough.'],
    '12>15': ['Quiseste tanto que ficaste vazio. Assumiste que não estás bem. Já é um começo.', 'You wanted so much you ended up empty. You admitted you’re not okay. That’s a start.'],
    '13>15': ['No silêncio, ouviste-te. Assumiste que não estás bem. Já é um começo.', 'In the silence, you heard yourself. You admitted you’re not okay. That’s a start.'],
    '12>16': ['Nada do que compraste chegou. Choraste, e saiu tudo o que estava preso.', 'Nothing you bought was enough. You cried, and everything stuck came out.'],
    '13>16': ['O silêncio pesou demais. Choraste, e saiu tudo o que estava preso.', 'The silence got too heavy. You cried, and everything stuck came out.'],
    errors: [
      ['a guardar o progresso... falhou', 'saving progress... failed'],
      ['ERRO: limbo.exe não está a responder', 'ERROR: limbo.exe is not responding'],
      ['memória corrompida. a continuar na mesma.', 'memory corrupted. carrying on anyway.'],
      ['não há saída deste nível', 'there is no way out of this level'],
    ],
  },

  // What the game says when a song is skipped: one for each, and a few for the rest. [Portuguese, English]
  skips: {
    1: ['Já conheces as regras, é?', 'Already know the rules, huh?'],
    3: ['Siga, então.', 'Moving on, then.'],
    4: ['Calma, calma.', 'Easy, easy.'],
    6: ['Saltaste o Pulso? Que frieza.', 'Skipped Pulso? Cold.'],
    7: ['Afinal não voltaste.', 'Didn’t come back after all.'],
    9: ['Saíste na primeira saída.', 'Took the first exit.'],
    10: ['Já a sair da pista?', 'Leaving the dancefloor already?'],
    12: ['Afinal querias menos.', 'Wanted less after all.'],
    13: ['Saltar o Silêncio. Justo.', 'Skipping Silence. Fair.'],
    15: ['Fugir também é resposta.', 'Running away is an answer too.'],
    16: ['Nem uma lágrima?', 'Not even one tear?'],
    any: [
      ['Saltaste? Eu ouvi isso.', 'Skipped? I heard that.'],
      ['Uau. Nem o refrão.', 'Wow. Not even the chorus.'],
    ],
  },
  tracks: [
    {
      n: 1, title: 'Intro', en: 'Intro', vibe: 'night',
      words: `
Bem-vindo ao jogo que não vais poder ganhar | Welcome to the game you won’t be able to win
O fim é certo como é certo começar | The end is as certain as the start
Escolhe quem queres ser | Choose who you want to be
O que queres sentir | What you want to feel
Quem chora uma vez | Whoever cries once
Chora até sorrir | Cries until they smile

Bem-vindo ao jogo | Welcome to the game
Em que a regra é perder | Where the rule is to lose
O fim é certo | The end is certain
Como é certo | As certain
Começar | As the start
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça · Interpretação, instrumentos e vozes: LEFT. · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 2, title: 'Level 1', en: 'Level 1', call: 1, voice: 'L-ALI', caller: ['Amigo', 'Friend'], vibe: 'lcd',
      question: ['Tens estado em baixo? Vais levantar a cabeça e seguir em frente? Ou bater com a cabeça em tudo?',
                 'You’ve been feeling down? Are you going to lift your head and move on? Or bang your head against everything?'],
      // what the voice says: one message at a time, from one second of the track to another (from-to | PT | EN),
      // then at choose, only the choice
      chat: { choose: 20, words: `
7-10 | então, ouvi dizer que estás um bocado em baixo, a vida tem-te tratado mal? | so, I heard you’re feeling kind of down, has life been treating you badly?
10-19 | ouve, deste lado parece que só tens duas opções: ou levantas a cabeça e segues em frente, ou perdes a cabeça e rebentas com tudo à tua volta. o que é que tu pensas fazer? | listen, from where I’m standing it looks like you’ve only got two options: either you lift your head and move on, or you lose your head and blow up everything around you. what are you planning to do?
` },
      options: [
        { to: 3, pt: 'Levantar a cabeça e seguir em frente', en: 'Lift my head and move on' },
        { to: 4, pt: 'Bater com a cabeça em tudo', en: 'Bang my head against everything' },
      ],
      credits: 'Produção: LEFT., Guire · Música e letra: António Graça · Voz: L-ALI · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 3, title: 'Siga', en: 'Keep going', vibe: 'sunrise', from: 2.6,  // the track opens with 3 s of silence
      words: `
Deitado na cama a pensar no fim | Lying in bed, thinking about the end
Se no meu velório vão chorar por mim | Whether at my wake they’ll cry for me
Se no fim da história acabo sozinho | Whether at the end of the story I end up alone
Se vou ficar no Limbo | Whether I’ll stay in Limbo

Outro dia acordo já tou bem melhor | Next day I wake up, I’m already much better
Sinto o sol na cara, vivo o agora | I feel the sun on my face, I live the now
Alma renovada, venha o encore | Soul renewed, bring on the encore
Já não vou ficar no Limbo | I won’t stay in Limbo anymore
(Agora pensa) | (Now think)

Se não tivesses o que tens quem eras tu? | If you didn’t have what you have, who would you be?
Não conhecesses quem conheces quem eras tu? | If you didn’t know who you know, who would you be?
Acordas e olhas ao espelho não és tu… | You wake up and look in the mirror, it’s not you…

Mas se a vida é um jogo então siga | But if life is a game, then keep going
Não fiques parado vai siga | Don’t stand still, come on, keep going
Se a vida é um jogo então siga | If life is a game, then keep going
Não fiques parada vai siga | Don’t stand still, come on, keep going
Se a vida é um jogo então siga | If life is a game, then keep going
Se só tens uma vida então siga | If you only have one life, then keep going

Ficaste com medo | You got scared
De cortar a corda | Of cutting the rope
Vives amarrado | You live tied
Ao que não te acorda | To what doesn’t wake you up
Se vem um dilema | When a dilemma comes
Tu perdes o Norte | You lose your North
Para, pensa, segue, vai. | Stop, think, move on, go.

Se não tivesses o que tens quem eras tu? | If you didn’t have what you have, who would you be?
Não conhecesses quem conheces quem eras tu? | If you didn’t know who you know, who would you be?
Acordas e olhas ao espelho não és tu… (Quem és tu?) | You wake up and look in the mirror, it’s not you… (Who are you?)
Se dizes que está tudo bem quem és tu? | If you say everything’s fine, who are you?
Se queres parar o jogo a meio quem és tu? | If you want to stop the game halfway, who are you?
Já não conheces o espelho… | You don’t know the mirror anymore…

Mas se a vida é um jogo então siga | But if life is a game, then keep going
Não fiques parado vai siga | Don’t stand still, come on, keep going
Se a vida é um jogo então siga | If life is a game, then keep going
Não fiques parada vai siga | Don’t stand still, come on, keep going
Se a vida é um jogo então siga | If life is a game, then keep going
Se só tens uma vida então siga | If you only have one life, then keep going
`,
      credits: 'Produção: Luar, LEFT. · Música e letra: António Graça · Interpretação: LEFT. · Guitarras, baixo e teclas: Luar · Bateria: Francisco Santos · Vozes: LEFT., Helena Silva, Mikkel Solnado, Luar · Mistura e master: Michael Ferreira',
    },
    {
      n: 4, title: 'Violento (ft. L-Ali)', en: 'Violent', vibe: 'riot',
      words: `
Violento, não dormi nada | Violent, I didn’t sleep at all
Tou violento, saí de casa | I’m violent, I left the house
Bem violento, saiam da frente | Real violent, get out of my way
Eu tou violento, violento | I’m violent, violent
Violento, cara trancada | Violent, face locked shut
Tou violento, arma apontada | I’m violent, gun aimed
Tou violento, gatilho apertado | I’m violent, trigger squeezed
Foi violento, virei violento | It was violent, I turned violent

Hoje não quero saber | Today I don’t care
Hoje alguém vai ter que sofrer | Today someone’s going to have to suffer
Hoje vou renascer tipo Cristo | Today I’ll be reborn like Christ
Em modo Lucifer | In Lucifer mode
Tragam-me o vinho tinto | Bring me the red wine
Que o meu rim sozinho | My kidney on its own
Faz desaparecer | Makes it disappear
Traz a reserva | Bring the reserve
Hoje é pá guerra | Today it’s war
Não tenho nada a perder | I’ve got nothing to lose
A escolha é minha faço o que eu quiser | The choice is mine, I do what I want
Fico por cima venha quem vier | I stay on top, whoever comes
Caguei na rima só pa te mostrar | I trashed the rhyme just to show you
Que a escolha é minha | That the choice is mine
E hoje eu tou | And today I’m

Violento, não dormi nada | Violent, I didn’t sleep at all
Tou violento, saí de casa | I’m violent, I left the house
Bem violento, saiam da frente | Real violent, get out of my way
Eu tou violento, violento | I’m violent, violent
Violento, cara trancada | Violent, face locked shut
Tou violento, arma apontada | I’m violent, gun aimed
Tou violento, gatilho apertado | I’m violent, trigger squeezed
Foi violento, virei violento | It was violent, I turned violent

Se eu entrar decora | If I walk in, take note
Promete que jogas por mais um momento | Promise you’ll play for one more moment
Sem armas só bolas a olhar pra Norte | No guns, just balls, facing North
Sem rosa-dos-ventos | Without a compass rose
Se tás agora eu sei que não choras | If you’re here now, I know you don’t cry
Pa ter mais do mesmo | To get more of the same
Dancei com a morte durante umas horas | I danced with death for a few hours
E vi-a morrer. | And watched her die.
Já me só vês às vezes | Now you only see me sometimes
Já me só vês às vezes | Now you only see me sometimes
O beat tá bem aceso | The beat is burning bright
E eu dou gás em linhas | And I give it gas, line by line
Eles querem saber o que Diesel no verso | They want to know what diesel’s in the verse
Ninguém soa ao mesmo, | Nobody sounds the same,
Isto é gasolina. | This is gasoline.
O que trago é Elixir Tantum | What I bring is Tantum mouthwash
Tanto bebem então cuspam | They drink so much, so spit it out
Sei que tenho tado violento | I know I’ve been violent
O tempo violento e com chuva | The weather violent and rainy
Sei que ultimamente a mente tem tado confusa | I know lately my mind’s been confused
Mano tu sai-me da frente ou mete-me um açaime na fuça | Bro, get out of my way or put a muzzle on my face

Violento, não dormi nada | Violent, I didn’t sleep at all
Tou violento, saí de casa | I’m violent, I left the house
Bem violento, saiam da frente | Real violent, get out of my way
Eu tou violento, violento | I’m violent, violent
Violento, cara trancada | Violent, face locked shut
Tou violento, arma apontada | I’m violent, gun aimed
Tou violento, gatilho apertado | I’m violent, trigger squeezed
Foi violento, virei violento | It was violent, I turned violent

Ouvi o galopar | I heard the galloping
De quem não tem mais a perder | Of someone with nothing left to lose
E deixar que a violência em mim | And letting the violence in me
Possa ser um sinal | Be a sign
Que a culpa remoi e a tua é fatal | That guilt gnaws, and yours is fatal
E marca-te a pele como presa ideal | And marks your skin as the perfect prey
E quem te consome | And the one who consumes you
Sou eu no final | Is me, in the end
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça, Hélder, Rossana · Interpretação: LEFT., L-Ali, Rossana · Sintetizadores e beat: LEFT. · Vozes: LEFT., L-Ali, Rossana · Mistura e master: Michael Ferreira',
    },
    {
      n: 5, title: 'Level 2', en: 'Level 2', call: 2, voice: 'Ana Mariano', caller: ['Namorada', 'Girlfriend'], vibe: 'lcd',
      question: ['Isto não está a correr muito bem. Queres acabar?',
                 'This isn’t going very well. Do you want to end it?'],
      // what the voice says: one message at a time, from one second of the track to another (from-to | PT | EN),
      // then at choose, only the choice
      chat: { choose: 29, words: `
8-14.5 | oi, hum, olha temos mesmo que tomar uma decisão, | hi, um, look, we really have to make a decision.
14.5-22 | eu percebo que seja muito difícil para os dois, mas, honestamente, não vai ficar mais fácil, e não podemos ficar neste limbo para sempre. | I get that it’s really hard for both of us, but honestly, it’s not going to get any easier, and we can’t stay in this limbo forever.
22-26.8 | se acabar for a melhor decisão, então é encarar e seguir em frente. | if ending it is the best decision, then we face it and move on.
26.8-29 | mas eu preciso mesmo de saber: o que é que tu queres? | but I really need to know: what do you want?
` },
      options: [
        { to: 7, pt: 'Sim, acabar', en: 'Yes, end it' },
        { to: 6, pt: 'Não acabar', en: 'Don’t end it' },
      ],
      credits: 'Produção: LEFT., Guire · Música e letra: António Graça · Voz: Ana Mariano · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 6, title: 'Pulso (ft. Jüra)', en: 'Pulse', vibe: 'heart',
      words: `
Quero morrer ao teu lado | I want to die by your side
Bebo o teu veneno por ti | I drink your poison for you
Não tenho medo de ser enterrado | I’m not afraid of being buried
Ao teu lado | By your side
Romeu Julieta no fim | Romeo, Juliet at the end
Joga a roleta, aponta e dispara | Spin the roulette, aim and fire
Ao teu lado o tempo para | By your side, time stops
Ao teu lado o pulso | By your side, my pulse
Dispara, eu paro | Races, I stop
Ao teu lado o tempo para | By your side, time stops

Eu sou | I am
All em 1 | All in 1
Sou simpático | I’m nice
Prático | Practical
Dramático talvez | Dramatic, maybe
Funcionário do mês | Employee of the month
Di Caprio | DiCaprio
No cenário | On set
Mario no meu gameboy | Mario on my Game Boy
Morro logo, nem me dói | I die right away, it doesn’t even hurt
Eu sou Capuleto | I’m a Capulet
No cap | No cap
Donnie Darko | Donnie Darko
Johnny Depp | Johnny Depp
Vi-te pela zona | I saw you around
Pões Montéquio no map | You put Montague on the map
Reparei no teu dresscode | I noticed your dress code
I’m impressed so | I’m impressed, so
Vamos pa Verona | Let’s go to Verona
Aluguei um lambo | I rented a Lambo

Eu não quero parecer too much | I don’t want to seem too much
Mas tu tens um dom peculiar | But you have a peculiar gift
Um dia vão-me enterrar | One day they’ll bury me
E quando tudo acabar | And when it’s all over

Eu quero morrer ao teu lado | I want to die by your side
Bebo o teu veneno por ti | I drink your poison for you
Não tenho medo de ser enterrado | I’m not afraid of being buried
Ao teu lado | By your side
Romeu Julieta no fim | Romeo, Juliet at the end
Joga a roleta, aponta e dispara | Spin the roulette, aim and fire
Ao teu lado o tempo para | By your side, time stops
Ao teu lado o pulso | By your side, my pulse
Dispara, eu paro | Races, I stop
Ao teu lado o tempo para | By your side, time stops

Tu és um pouco de tudo | You’re a little of everything
Dás-me a volta e na volta | You turn me around, and on the way back
Viras o meu mundo | You turn my world over
Exagero na medida certa | Too much, in just the right measure
E sem que eu peça acertas | And without my asking, you get it right
Meu maior medo elevas | My biggest fear, you raise it higher
Contigo eu cedo | With you, I give in
Aceleras-me a pulsação | You speed up my pulse
Sem ti aqui não faz sentido | Without you here, nothing makes sense
Só dói, dói | It just hurts, hurts
Viver a vida contigo | Living life with you
Já foi o que foi | Was what it was
Se morrer é mesmo obrigatório | If dying really is mandatory
Amor fazemos do teu nosso velório | Love, let’s make your wake ours

Eu não quero parecer too much | I don’t want to seem too much
Mas tu tens um dom peculiar | But you have a peculiar gift
Um dia vão-me enterrar | One day they’ll bury me
E quando tudo acabar | And when it’s all over

Eu quero morrer ao teu lado | I want to die by your side
Bebo o teu veneno por ti | I drink your poison for you
Não tenho medo de ser enterrado | I’m not afraid of being buried
Ao teu lado | By your side
Romeu Julieta no fim | Romeo, Juliet at the end
Joga a roleta, aponta e dispara | Spin the roulette, aim and fire
Ao teu lado o tempo para | By your side, time stops
Ao teu lado o pulso | By your side, my pulse
Dispara, eu paro | Races, I stop
Ao teu lado o tempo para | By your side, time stops

Ao teu lado | By your side
Bebo o teu veneno por ti | I drink your poison for you
Ao teu lado | By your side
Enterrado | Buried
`,
      credits: 'Produção: LEFT., YANAGUI, Kidonov · Música e letra: António Graça, Jüra · Interpretação: LEFT., Jüra · Teclados: YANAGUI · Baixo: LEFT. · Beat: LEFT., Kidonov · Vozes: LEFT., Jüra · Mistura e master: Michael Ferreira',
    },
    {
      n: 7, title: 'Volto a ti', en: 'I come back to you', vibe: 'sepia',
      words: `
Feitas as contas | All things considered
Já conto em ficar | I’m already counting on staying
No mesmo espaço contigo ao meu lado | In the same space, with you by my side
Morder-te o braço | Biting your arm
Até não deixares | Until you won’t let me
E no teu abraço | And in your embrace
Não querer acordar | Not wanting to wake up

Liga a qualquer hora | Call me any time
Eu volto a ti | I come back to you
Se me for embora | If I go away
Eu volto a ti | I come back to you
Às vezes demoro a | Sometimes it takes me a while
Encontrar o teu lugar em mim | To find your place in me
Mas eu sei que agora | But I know that now
Eu volto a ti | I come back to you

Passaram anos, e tudo acabou. | Years went by, and it all ended.
Foram-se os planos de sermos avós. | Gone are the plans of growing old as grandparents.
Segues em frente pra onde eu não vou | You move on, to where I won’t go
E daqui pra sempre não sabes quem sou. | And from here on, forever, you don’t know who I am.
Sei que me odeias pra facilitar | I know you hate me to make it easier
Todo o processo de abandonar | The whole business of leaving
Trago nas veias o peso de nós | I carry in my veins the weight of us
Não estou por perto, mas oiço a tua voz. | I’m not around, but I hear your voice.

Liga a qualquer hora | Call me any time
Eu volto a ti | I come back to you
Se me for embora | If I go away
Eu volto a ti | I come back to you
Às vezes demoro a | Sometimes it takes me a while
Encontrar o teu lugar em mim | To find your place in me
Mas eu sei que agora eu volto a ti | But I know that now I come back to you

Liga a qualquer hora | Call me any time
Eu volto a ti | I come back to you
Se me for embora | If I go away
Eu volto a ti | I come back to you
Às vezes demoro a | Sometimes it takes me a while
Dar valor ao amor que perdi | To value the love I lost
Mas eu sei que agora | But I know that now
Eu volto a ti | I come back to you
Se é para casar bora | If it’s to get married, let’s go
Eu volto a ti | I come back to you
Eu volto a ti | I come back to you
Não volto a ti | I won’t come back to you
Não volto a ti | I won’t come back to you
`,
      credits: 'Produção: LEFT., Luar · Música e letra: António Graça · Interpretação: LEFT. · Guitarras: LEFT., Luar · Cordas: Luar · Vozes: LEFT., Luar, Helena Silva · Mistura e master: Michael Ferreira',
    },
    {
      n: 8, title: 'Level 3', en: 'Level 3', call: 3, voice: 'Miguel Garcia', caller: ['Amigo 2', 'Friend 2'], vibe: 'lcd',
      question: ['Puto, estou farto. Bora sair de Lisboa e viajar? Ou preferes só ir dançar a algum lado?',
                 'Kid, I’m fed up. Let’s get out of Lisbon and travel? Or would you rather just go dancing somewhere?'],
      // what the voice says: one message at a time, from one second of the track to another (from-to | PT | EN),
      // then at choose, only the choice
      chat: { choose: 28, words: `
10.5-15.7 | então amigo como é que tens andado? já não sei de ti há bué, sei que tens andado fechado na tua bolha... | so, buddy, how have you been? haven’t heard from you in ages, I know you’ve been shut away in your bubble...
15.7-20.2 | mas olha tem-me apetecido bué sair de Lisboa, espairecer um bocado, dar um passeio... | but look, I’ve been dying to get out of Lisbon, clear my head a bit, go for a ride...
20.2-25 | ou então, dar um passinho de dança, ir a uma festa. | or else, bust a little dance move, go to a party.
25-28 | bora sair de casa, diz-me o que te apetece fazer. | let’s get out of the house, tell me what you feel like doing.
` },
      options: [
        { to: 9, pt: 'Sair de Lisboa e viajar', en: 'Leave Lisbon and travel' },
        { to: 10, pt: 'Ir dançar a algum lado', en: 'Go dancing somewhere' },
      ],
      credits: 'Produção: LEFT., Guire · Música e letra: António Graça · Voz: Miguel Garcia · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 9, title: 'A1 Norte', en: 'A1 North', vibe: 'road',
      words: `
Bora pra cima passar uma temporada | Let’s head up north for a while
Eu levo o meu Nissan | I’ll take my Nissan
Traz mudas de roupa | Bring a change of clothes
Lembra-me a tua morada | Remind me of your address
Apanho-te amanhã | I’ll pick you up tomorrow
Eu estou meio de mal com a vida | I’m kind of at odds with life
Tou aziado | I’m sour
Quero recomeçar | I want to start over
Lisboa perdeu o sal | Lisbon lost its salt
Quero mudar de lados | I want to switch sides
Só temos que atestar | We just have to fill the tank
Se der o sono eu dou-te o meu lugar | If I get sleepy, I’ll give you the wheel

Na estrada só eu e tu | On the road, just you and me
A1 Norte, sem seguro | A1 North, no insurance
Não paguei a renovação | I didn’t pay the renewal
Mas desde que não nos parem | But as long as they don’t pull us over
Que nenhum pneu se fure | And no tyre goes flat
A1 Norte é condição | A1 North is the deal

A1 Norte | A1 North
A1 Norte | A1 North

Mete a terceira | Put it in third
Que a quinta não está segura | ’Cause fifth isn’t safe
E eu quero ir devagar | And I want to go slow
Se nos querem ultrapassar | If they want to overtake us
Se encostam passam por cima | If they come close, let them go past
Eu nem vou buzinar | I won’t even honk
Porque eu | Because I’m
Estou bem melhor | So much better
Agora que entrou a brisa | Now that the breeze came in
Da estrada nacional | From the old national road
Voltamos pela A1 Norte | We come back on the A1 North
Com a mesma roupa vestida | Wearing the same clothes
O banho é opcional | Showers are optional
Tou a gozar | Just kidding
Mergulhamos em qualquer lugar | We’ll dive in anywhere

Na estrada só eu e tu | On the road, just you and me
A1 Norte, sem seguro | A1 North, no insurance
Não paguei a renovação | I didn’t pay the renewal
Mas desde que não nos parem | But as long as they don’t pull us over
Que nenhum pneu se fure | And no tyre goes flat
A1 Norte é condição | A1 North is the deal

Na estrada só eu e tu | On the road, just you and me
A1 Norte, sem futuro | A1 North, no future
Eu nem passei na inspecção | I didn’t even pass inspection
Mas desde que não disparem | But as long as no speed camera flashes
Que nenhum pneu se fure | And no tyre goes flat
A1 Norte é solução | A1 North is the answer

A1 Norte | A1 North
A1 Norte | A1 North
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça · Interpretação: LEFT. · Guitarras: LEFT., miguele · Cordas e bateria: LEFT. · Vozes: LEFT., Inês Apenas · Mistura e master: Michael Ferreira',
    },
    {
      n: 10, title: 'Dançar', en: 'To dance', vibe: 'club',
      words: `
Saio e faz calor na rua | I go out and it’s hot in the street
Dá pra ver a lua | You can see the moon
A pairar por cima do Tejo | Hanging over the Tagus
Chegamos está fila na porta | We get there, there’s a line at the door
Mas tu não te importas | But you don’t mind
De ficar a esperar por perto | Waiting close by

Tá na hora | It’s time
Os três gajos à frente foram barrados fora | The three guys in front got turned away
Nós entramos, tamos contentes, tu dizes “bora” | We get in, we’re happy, you say “let’s go”
Hoje é pra dançar | Tonight is for dancing

E eu vou dançar até | And I’m going to dance until
Não me aguentar de pé | I can’t stand up
Até a perna falhar | Until my legs give out
Eu vou continuar | I’ll keep going
Eu vou dançar até | I’m going to dance until
Não me aguentar de pé | I can’t stand up
E quando a noite acabar | And when the night is over
Eu vou continuar | I’ll keep going

Tá a passar reggaeton | They’re playing reggaeton
Eu nem sou muito desse tipo de som | I’m not really into that kind of sound
Mas o corpo mexe sozinho | But my body moves on its own
Esquerda pá direita, mansinho | Left to right, nice and slow
Mansinho (yeah) | Nice and slow (yeah)
Eu vi como olhaste pra mim | I saw how you looked at me
Eu nem faço caso, mas fico | I don’t make a thing of it, but I’m left
Com vontade de te agarrar | Wanting to hold you
De pegar em ti e bazar | To grab you and get out of here

Mas eu vou dançar até | But I’m going to dance until
Não me aguentar de pé | I can’t stand up
Até a perna falhar | Until my legs give out
Eu vou continuar | I’ll keep going
Eu vou dançar até | I’m going to dance until
Não me aguentar de pé | I can’t stand up
E quando a noite acabar | And when the night is over
Eu vou continuar | I’ll keep going

Saio e faz calor na rua | I go out and it’s hot in the street
Dá pra ver a lua | You can see the moon
A pairar por cima do Tejo | Hanging over the Tagus
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça · Interpretação: LEFT. · Bateria, sintetizadores, baixo e vozes: LEFT. · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 11, title: 'Level 4', en: 'Level 4', call: 4, voice: 'Luar', caller: ['Irmão', 'Brother'], vibe: 'lcd',
      question: ['O que é que tu queres afinal? Queres mais? Ou queres só ficar satisfeito com o que tens?',
                 'So what is it you want? Do you want more? Or do you just want to be happy with what you have?'],
      options: [
        { to: 12, pt: 'Querer mais', en: 'Want more' },
        { to: 13, pt: 'Ficar satisfeito com o que tenho', en: 'Be happy with what I have' },
      ],
      credits: 'Produção: LEFT. · Música e letra: António Graça · Voz: Luar · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 12, title: 'Quero mais', en: 'I want more', vibe: 'gold',
      words: `
Nasci malcriado | I was born a brat
Emprestado aos meus pais | On loan to my parents
Filho do diabo | Son of the devil
Afastado dos demais | Kept apart from the rest
Jurei ser maior | I swore I’d be bigger
Mas ainda não ganhei | But I haven’t won yet
Um dia vou ter sorte | One day I’ll get lucky
Não quero um gato | I don’t want a cat
Quero um jaguar | I want a jaguar
Hoje no prato | Today on my plate
Quero caviar | I want caviar
Quero um Ferrari | I want a Ferrari
Para poder mostrar | So I can show
Que eu quero, eu quero | That I want, I want
Eu quero mais | I want more
Eu quero mais | I want more

Eu quero o escuro e a luz | I want the dark and the light
Quero mudar o mundo | I want to change the world
Sem carregar a cruz | Without carrying the cross
Eu quero ser profundo | I want to be deep
Mas quero ver corpos nus | But I want to see naked bodies
Quero comer o menu | I want to eat the whole menu
Quero falar a verdade | I want to tell the truth
Mas mentir a Jesus | But lie to Jesus
E se a morte é tabu | And if death is taboo
Então eu visto o capuz | Then I put on the hood
Eu sou o escuro e a luz | I am the dark and the light
E eu vou ser | And I will be
Rei sem medo | A king without fear
Homem forte | A strong man
Não concedo | I concede
Nada à morte | Nothing to death
Não quero um gato | I don’t want a cat
Quero um jaguar | I want a jaguar
Hoje no prato | Today on my plate
Quero caviar | I want caviar
Quero um Ferrari | I want a Ferrari
Para poder mostrar | So I can show
Que eu quero, eu quero | That I want, I want
Eu quero mais | I want more
Eu quero mais | I want more
`,
      credits: 'Produção: LEFT., Luar · Música e letra: António Graça · Interpretação: LEFT. · Guitarras: LEFT., Luar · Sopros, bateria e vozes: LEFT. · Mistura e master: Michael Ferreira',
    },
    {
      n: 13, title: 'Silêncio', en: 'Silence', vibe: 'quiet', hush: true,  // the game here: touch nothing
      words: `
Estar só | To be alone
Em silêncio | In silence
Parar | To stop
Sem ficar | Without staying
Sem tempo | Without time
O dia do ano | The day of the year
A hora do mês | The hour of the month
Momentos | Moments
Parar | To stop
Sem ficar | Without staying
Sem tempo | Without time
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça · Interpretação: LEFT. · Guitarras, cordas, bateria e vozes: LEFT. · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 14, title: 'Level 5', en: 'Level 5', call: 5, voice: 'Manuela Maciel', caller: ['Mãe', 'Mom'], vibe: 'lcd',
      question: ['Quando te vais abaixo, tens que assumir que não estás bem, e aceitar-te por isso. Ou então chora só, filho, chora.',
                 'When you hit bottom, you have to admit you’re not okay, and accept yourself for it. Or else just cry, son, cry.'],
      options: [
        { to: 15, pt: 'Assumir que não estou bem', en: 'Admit I’m not okay' },
        { to: 16, pt: 'Chorar', en: 'Cry' },
      ],
      credits: 'Produção: LEFT. · Música e letra: António Graça · Voz: Manuela Maciel · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 15, title: 'Não estou bem', en: 'I’m not okay', vibe: 'overcast',
      words: `
Não vou mentir | I won’t lie
Eu não estou bem | I’m not okay
Não vou sorrir | I won’t smile
Vai parecer fake | It’ll look fake
Não sou quem eu imaginei ser | I’m not who I imagined I’d be
E nunca serei | And I never will be

Dizem | They say
Isso vai passar | It’ll pass
Lá pro fim do mês | By the end of the month
Hoje estás no lodo | Today you’re in the mud
Amanhã vais ver | Tomorrow you’ll see
Fácil é falar | Talk is easy
Eu só oiço clichés | All I hear is clichés

E eu não estou bem | And I’m not okay
Eu não estou bem | I’m not okay
Não conto a ninguém | I don’t tell anyone
Mas hoje eu sei | But today I know
Que eu não estou bem | That I’m not okay

Não tenho a pausa do Cobain | I don’t have Cobain’s pause
Não tenho a tinta do Slow J | I don’t have Slow J’s ink
Não tenho aquilo que sonhei ter | I don’t have what I dreamed of having
E nunca terei | And I never will

Não estou no topo do meu game | I’m not at the top of my game
Não assinei o Hall of Fame | I haven’t signed the Hall of Fame
Não sou quem eu imaginei ser | I’m not who I imagined I’d be
E doa o que doer | And however much it hurts
Um dia vou ter que aprender | One day I’ll have to learn

Dizem | They say
Tu não és diferente | You’re no different
Dessas pop stars | From those pop stars
Não falta talento | It’s not talent you lack
Falta acreditares | It’s believing
Rapaz é só dares um passo de cada vez | Boy, just take it one step at a time
Clichés | Clichés

E eu não estou bem | And I’m not okay
Eu não estou bem | I’m not okay
Não conto a ninguém | I don’t tell anyone
Mas hoje eu sei | But today I know
Que eu não estou bem | That I’m not okay

Eu juro | I swear
Nunca te agradar | Never to please you
Só pra me aceitares no fim | Just so you’ll accept me in the end
Eu juro | I swear
Não me acomodar | Not to settle
Só para tu gostares de mim | Just so you’ll like me
Eu juro | I swear
Hoje vou mudar | Today I’ll change
Eu juro | I swear
Vou só aceitar-me assim | I’ll just accept myself as I am
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça · Interpretação: LEFT. · Guitarras e cordas: LEFT. · Piano: YANAGUI · Bateria: Alex Mey · Vozes: LEFT., Coro Infantil de Santo Amaro de Oeiras · Mistura e master: Michael Ferreira',
    },
    {
      n: 16, title: 'Chora', en: 'Cry', vibe: 'tears',
      words: `
(Há tanto tempo que não choro) | (It’s been so long since I cried)

Tenho sonhado que acordo | I’ve been dreaming that I wake up
Dentro de um olho afogado | Inside a drowned eye
Tipo desenho animado | Like a cartoon
Descompressão animal | Animal decompression
Eu sou o touro na praça | I’m the bull in the ring
E a faca pela dorsal | And the knife down the spine
Antes de telejornal | Before the evening news
Não perca esta promoção | Don’t miss this offer
Chore a metade do preço | Cry at half price
É essa a nossa ambição | That is our ambition
Eu pago o que for preciso | I’ll pay whatever it takes
Eu vendo o que for preciso | I’ll sell whatever it takes
Eu só preciso que chores | I just need you to cry

Chora | Cry
Já faz tempo | It’s been a while
Eu nem me lembro da última vez | I don’t even remember the last time
Que olhei para dentro e me deixei perder | I looked inside and let myself get lost
Chora o peso | Cry the weight
Chora a mágoa | Cry the hurt
Chora o medo de chorar | Cry the fear of crying
Chora chora minha gente | Cry, cry, my people
Que a vida vai | For life goes by

(Há tanto tempo que não choro) | (It’s been so long since I cried)

Quando o Brofonso Heriques | When Brofonso Heriques
Matou a mãe pelo título | Killed his mother for the title
Pa reforçar o currículo | To beef up his CV
(Ele não chorou) | (He didn’t cry)
Quando o ministro politicamente preso | When the politically jailed minister
Por branquemento viu-se | For laundering found himself
Ironicamente teso | Ironically broke
(Ele não chorou) | (He didn’t cry)
Quando o Ulysses perdido | When lost Ulysses
Ouvindo o canto das ninfas | Hearing the nymphs’ song
Atou os pés à clavícula | Tied his feet to his collarbone
(Ele não chorou) | (He didn’t cry)
Estou sem modelos que exemplifiquem o meu | I have no models to show me mine
Logicamente que um Deus | Of course a God
Que nunca rogou aos céus | Who never begged the heavens
Não chora | Doesn’t cry

Chora | Cry
Já faz tempo | It’s been a while
Eu nem me lembro da última vez | I don’t even remember the last time
Que olhei para dentro e me deixei perder | I looked inside and let myself get lost
Chora o peso | Cry the weight
Chora a mágoa | Cry the hurt
Chora o medo de chorar | Cry the fear of crying
Chora chora minha gente | Cry, cry, my people
Que a vida vai | For life goes by
`,
      credits: 'Produção: LEFT. · Música e letra: António Graça · Interpretação: LEFT. · Piano, bateria e vozes: LEFT. · Mistura: LEFT. · Master: Michael Ferreira',
    },
    {
      n: 17, title: 'Limbo (fim)', en: 'Limbo (the end)', vibe: 'void',
      credits: 'Produção: LEFT. · Música e letra: António Graça · Vozes: LEFT. · Mistura: LEFT. · Master: Michael Ferreira',
    },
  ],
};
