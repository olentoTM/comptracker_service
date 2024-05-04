const mongoose = require("mongoose");
const EventInfo = require("../models/eventInfo");
const { getSessionInfo } = require("./readData");
const sessionInfo = require("../models/sessionInfo");
const { response } = require("express");
const players = require("../models/player");
const eventInfo = require("../models/eventInfo");

exports.createNewEvent = async (req, res) => {
  const { event_name, max_participants } = req.body;

  await EventInfo.create({
    event_name: event_name,
    sessions: [],
    start_date: null,
    end_date: null,
    participants: [],
    max_participants: max_participants,
  })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json("Failed to create tournament ", err);
    });
};

exports.deleteEvent = async (req, res) => {
  const id = req.params.id;
  // Täällä pitäisi myös jossain vaiheessa poistaa eventtiin liittyvät sessiot!!!
  // Muuten ne jäävät lojumaan tietokantaan ja vievät sieltä tilaa!
  await EventInfo.findByIdAndDelete(id)
    .then(
      res
        .status(200)
        .json(
          `Tournament with ID ${id} has been succesfully removed from database.`
        )
    )
    .catch((err) => {
      res.status(500).json(`Failed to delete tournament with ID ${id} `, err);
    });
};

exports.addNewParticipant = async (req, res) => {
  // Tarkistetaan ettei saman nimistä osallistujaa jo ole
  const { eventId, playerName } = req.body;
  const oldEvent = await eventInfo.findById({ _id: eventId });
  const dbPlayer = await players.findOne({
    name: { $regex: playerName, $options: "i" },
  });
  let finalName;

  console.log(
    oldEvent.participants.length + " VS " + oldEvent.max_participants
  );
  if (oldEvent.participants.length >= oldEvent.max_participants) {
    console.log("MAX_NO EXCEEDED");
    return res
      .status(500)
      .json("Maximum number of players have been added to the event.");
  }

  // Luodaan uusi pelaaja, jos sitä ei ole jo tietokannassa.
  if (dbPlayer == null) {
    finalName = await players.create({
      name: playerName,
    });
    console.log(finalName);
  } else {
    const existsInEvent = oldEvent.participants.find(
      ({ player }) => player.toString() === dbPlayer._id.toString()
    );
    console.log(existsInEvent);
    if (existsInEvent != undefined) {
      console.log("ALREADY EXISTS");
      return res.status(500).json("This player is already in the event");
    } else {
      finalName = dbPlayer;
    }
  }

  const newEventAddition = {
    player: finalName._id,
    position: oldEvent.participants.length + 1,
    points: 0,
  };

  // Lisätään osallistuja tapahtumaan
  const updatedEvent = await eventInfo
    .findByIdAndUpdate(eventId, {
      $push: { participants: newEventAddition },
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return res.status(500).json("Failed to add participant to event ", error);
    });

  // Päivitetään vielä mahdolliset sessiot
  if (oldEvent.sessions.length > 0) {
    sessionInfo
      .updateMany(
        { _id: { $in: oldEvent.sessions } },
        {
          $push: {
            results: { player: finalName._id, finished: false, position: 0 },
          },
        }
      )
      .then((results) => console.info("Päivitetty sessiot: ", results))
      .catch((error) => {
        return res
          .staus(500)
          .json("Pelaajan lisääminen sessioihin epäonnistui ", error);
      });
  }

  res.status(200).json(updatedEvent);
};

exports.createNewSession = async (req, res) => {
  const { eventId, map, date } = req.body;
  const sessionDate = new Date(date);

  //Käydään hakemassa osallistujalista
  const eventData = await EventInfo.findById(eventId)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      res.status(500).json(error);
    });

  //Luodaan uusi sessio
  const newSession = await sessionInfo
    .create({
      map: map,
      date: date,
      completed: false,
      results:
        eventData.participants.length > 0
          ? eventData.participants.map((p) => ({
              player: p.player,
              finished: false,
              position: 0,
              score: 0,
            }))
          : [],
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      res.status(500).json(error);
    });

  // Lisätään äskettäin luotu sessio tapahtumaan
  const modifiedEvent = await EventInfo.findByIdAndUpdate(eventData._id, {
    $push: { sessions: newSession._id },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      res.status(500).json(error);
    });

  // Jos uuden session aika on aikaisempi kuin tapahtuman aloitusaika, korvataan se
  if (sessionDate < eventData.start_date || eventData.start_date == null) {
    const newStartDate = await EventInfo.findByIdAndUpdate(eventData._id, {
      start_date: date,
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
    console.log("Event has new start date of ", newStartDate.start_date);
  }

  // Jos uuden session aika on myöhäisempi kuin tapahtuman lopetusaika, korvataan se
  if (sessionDate > eventData.end_date || eventData.end_date == null) {
    const newEndDate = await EventInfo.findByIdAndUpdate(eventData._id, {
      end_date: date,
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
    console.log("Event has new end date of ", newEndDate.end_date);
  }

  res.status(200).json(modifiedEvent);
};

exports.updateResults = async (req, res) => {
  const { eventId, sessionId, leaderboard } = req.body;

  // haetaan ensin vanhat tulokset
  const eventData = await eventInfo.findById(eventId).then((response) => {
    return response;
  });
  const sessionData = await sessionInfo.findById(sessionId).then((response) => {
    return response;
  });

  let eventParticipantList = eventData.participants;

  // Aloitetaan miinustamalla vanhat sessiopisteet tapahtumasta varmuudeksi
  eventParticipantList.forEach((p) => {
    let prevResult = sessionData.results.filter(
      (result) => result.player.toString() == p.player.toString()
    );

    p.points -= prevResult[0].score;
  });

  // Seuraavaksi plussataan uudet tulokset
  eventParticipantList.forEach((p) => {
    let newResult = leaderboard.filter(
      (result) => result.player._id.toString() == p.player.toString()
    );

    p.points += newResult[0].score;
  });

  // Ja lopuksi vielä pitää päivittää sijoitusnumero
  let sortedList = eventParticipantList.sort((a, b) => {
    const scoreA = a.points;
    const scoreB = b.points;

    if (scoreA < scoreB) {
      return 1;
    }
    if (scoreA > scoreB) {
      return -1;
    }
    return 0;
  });

  console.log("SORTED: ", sortedList);

  // Päivitetään position arvo indeksin mukaisesti.
  for (let i = 0; i < sortedList.length; i++) {
    sortedList[i].position = i + 1;
  }

  console.log("FINAL: ", sortedList);

  // Lisätään uusi leaderboard sessioon.
  await sessionInfo
    .findByIdAndUpdate(sessionId, { results: leaderboard })
    .then((response) =>
      console.log(
        "Updated session with ID of ",
        response._id,
        " with new session results."
      )
    )
    .catch((error) => {
      return res.status(500).json("Failed to update session results ", error);
    });

  // Ja lopuksi lisätään uudet pisteet tapahtumaan
  await eventInfo
    .findByIdAndUpdate(eventId, { participants: sortedList })
    .then((response) => {
      return res
        .status(200)
        .json("Updated event with ID of ", response._id, " with new results.");
    })
    .catch((error) => {
      return res.status(500).json("Failed to update event results ", error);
    });
};
