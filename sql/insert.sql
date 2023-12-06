INSERT INTO users (name, username, password, admin) VALUES ('Admin', 'admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true);
INSERT INTO users (name, username, password, completedSentences, completedVerifications) VALUES ('Jón Jónsson', 'jonjons', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', 2, 5);
INSERT INTO users (name, username, password, completedSentences, completedVerifications) VALUES ('Guðrún Guðrúnar', 'gunnagunn', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', 7, 6);
INSERT INTO users (name, username, password, completedSentences, completedVerifications) VALUES ('Tinni', 'testuser3', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', 13, 12);
INSERT INTO users (name, username, password, completedSentences, completedVerifications) VALUES ('Teitur', 'testuser4', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', 13, 20);
INSERT INTO users (name, username, password, completedSentences, completedVerifications) VALUES ('Torfi', 'testuser5', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', 21, 22);
INSERT INTO users (name, username, password, completedSentences, completedVerifications) VALUES ('Týr', 'testuser6', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', 25, 27);

INSERT INTO sentences (sentence, simplified) VALUES ('Þrátt fyrir að veðurfar sé óvissara á þessum áratug, verður ennþá þörf á aðlagningu samfélaga til að draga úr áhrifum loftslagsbreytinga.', true);
INSERT INTO sentences (sentence) VALUES ('Í kjölfar efnahagskreppu árið 2008 hafa margir sérfræðingar lagt áherslu á þörfina fyrir samhengi á milli stjórnmálamála, fjárlaga og samfélagsþátttöku til að ná fram varanlegum hagþróunarmöguleikum.');
INSERT INTO sentences (sentence) VALUES ('Þegar ítarleg rannsókn er framkvæmd á áhrifum nútíma tækniþróunnar á starfssvið og samfélagsstrúktúr, má sjá að hún hefur breytt samskiptum manna í grunninum, bæði á vinnustað og í daglegu lífi.');
INSERT INTO sentences (sentence) VALUES ('Þrátt fyrir að þjóðfélagið sé undir áhrifum flóknra stefnaþátta, er mikilvægt að viðhalda jafnvægi milli hagkerfisþróunar og varðveislu menningarinnar.');
INSERT INTO sentences (sentence) VALUES ('Á meðan tækninýjungar eru örugglega hrósverðar, er mikilvægt að varast áhrif þeirra á persónuvernd og einstaklingsfrelsi.');
INSERT INTO sentences (sentence) VALUES ('Í ljósi af flókinu samskiptaherferðar á alþjóðavettvangi, ber okkur að styrkja utanríkisþjónustu til að efla samstarf við aðrar þjóðir og aðila.');
INSERT INTO sentences (sentence) VALUES ('Hvernig ríki takast á við umhverfisvandamál og orkusamsetningu getur haft víðtæk áhrif á heimsvistunina og framgang mannkynsins.');
INSERT INTO sentences (sentence) VALUES ('Í skugga hækkandi menntunartækni er nauðsynlegt að tryggja jafn möguleika á menntun og að uppfæra kennsluferlið til að uppfylla kröfur framtíðarinnar.');
INSERT INTO sentences (sentence) VALUES ('Þótt íþróttum og hreyfingu sé stundum litið á sem einungis hollustugæfu, er það einnig vissulega þáttur í samfélagsþróun sem getur haft jákvæð áhrif á heilsu og félagsleg samfara.');
INSERT INTO sentences (sentence) VALUES ('Með vöxti aldursskeiðslu og fækkuðum afla er nauðsynlegt að endurskoða tryggingarkerfi og heilsugæslu til að uppfylla þörfum eldri borgara.');
INSERT INTO sentences (sentence) VALUES ('Rómverskur riddari réðst inn í Rómarborg, rændi þar og ruplaði radísum og rófum. Hvað eru mörg "r" í því?');

INSERT INTO simplifiedSentences (userId, sentenceId, simplifiedSentence, verified) VALUES (2, 1, 'Þótt að veðrið sé óvissara þennan áratug, verður ennþá þörf fyrir samfélög að minnka neikvæð áhrif loftslagsbreytinga.', false);
