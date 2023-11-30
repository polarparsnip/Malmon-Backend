# Máltækni Lokaverkefni - Bakendi

## Setup

Til að keyra síðu þarf .env skrá með þessum upplýsingum:
DATABASE_URL=postgres://postgres:@localhost/maltaekni **slóð á gagnagrunn**\
PGPASSWORD=password **þar sem password er lykilorð á gagnagrunn**\

Svo er hægt að nota eftirfarandi skipanir:

```bash
createdb maltaekni
# uppfæra env eins og lýst hér að ofan
npm run install
npm run setup # býr til gagnagrunn og fyllir af gögnum
npm run dev # keyrir upp dev
```
