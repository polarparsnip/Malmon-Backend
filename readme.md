# Málmon - Bakendi

## Setup

Til að keyra locally þarf fyrst að setja upp postgresql á tölvu.

Svo til að keyra server í development þarf .env skrá með þessum upplýsingum:
DATABASE_URL=postgres://postgres:@localhost/maltaekni **# slóð á gagnagrunn**\
PGPASSWORD=password **# þar sem password er lykilorð á gagnagrunn**\

Svo keyra eftirfarandi skipanir:

```bash
createdb maltaekni #búa til gagnagrunn í postgres
npm run install
npm run setup # býr til gagnagrunn og fyllir af gögnum
npm run dev # keyrir upp development mode
```

Opna [http://localhost:3000](http://localhost:3000) í vafra til að sjá vefþjón.
