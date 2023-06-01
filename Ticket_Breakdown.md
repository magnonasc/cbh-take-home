# Ticket Breakdown
We are a staffing company whose primary purpose is to book Agents at Shifts posted by Facilities on our platform. We're working on a new feature which will generate reports for our client Facilities containing info on how many hours each Agent worked in a given quarter by summing up every Shift they worked. Currently, this is how the process works:

- Data is saved in the database in the Facilities, Agents, and Shifts tables
- A function `getShiftsByFacility` is called with the Facility's id, returning all Shifts worked that quarter, including some metadata about the Agent assigned to each
- A function `generateReport` is then called with the list of Shifts. It converts them into a PDF which can be submitted by the Facility for compliance.

## You've been asked to work on a ticket. It reads:

**Currently, the id of each Agent on the reports we generate is their internal database id. We'd like to add the ability for Facilities to save their own custom ids for each Agent they work with and use that id when generating reports for them.**


Based on the information given, break this ticket down into 2-5 individual tickets to perform. Provide as much detail for each ticket as you can, including acceptance criteria, time/effort estimates, and implementation details. Feel free to make informed guesses about any unknown details - you can't guess "wrong".


You will be graded on the level of detail in each ticket, the clarity of the execution plan within and between tickets, and the intelligibility of your language. You don't need to be a native English speaker, but please proof-read your work.

## Your Breakdown Here

### Create database table for relating Facilities with Agents custom ids

Currently, there is no relation between `Facilities` and `Agents`, as everything is managed by their intermediate entity `Shifts`.
Our goal is to create a relation between these two entities that makes it possible to create custom ids for each `Agent` that is only applied for that `Facility`, i.e., It may be possible to the facility `ClipboardHealth Hospital` to name the agent `1234` as `head-magno.cruz`, but without interfering in the custom id from other facilities, which means that agent `1234` might also be called as `chief-magno.cruz` in another facility.

Implementation details:

In order to do such relation, we will need a new table that correlates `Facilities`'s internal database id with the `Agent`'s internal database id and the `Agent`'s custom id. And to make the rule explained in the text above apply, the primary key must be the `Facility`'s internal id **AND** the `Agent`'s internal id.
There's no constraints about `Agent`'s custom id uniqueness.

Time/effort estimate: 

Time estimate: It might take up to one hour to make such change and it might take another one for testing in the different environments.
Effort estimate: 2 in Fibonacci scale.

Acceptance criteria (development): 

- [ ] Migration script for creation of table `FacilityAgentCustomIds`;
- [ ] Migration script for rollback of table `FacilityAgentCustomIds`;
- [ ] Having the primary key composed of the `Facility`'s internal id **AND** the `Agent`'s internal id.

### Create function to set the Agent's custom id by Facility (`C` and `U` from CRUD)

After creating the `FacilityAgentCustomIds` table, we need a way to set the custom ids as requested by the Facilities.

Implementation details: 

In order to work with the new Agent's custom id we need a way to set them. And for that, we will need to create a function called `setAgentCustomIds(...facilityAgentCustomId)`, being the `facilityAgentCustomId` an object containing the `facilityId` and `agentId` internal database ids together with the agent's custom id.

Something like this:

```javascript
// Declaration
const setAgentCustomIds = (...facilityAgentCustomId) => {...};

// Call
setAgentCustomIds(
    {facilityId: 12, agentId: 1234, agentCustomId: 'head-magno.cruz'}, 
    {facilityId: 13, agentId: 1234, agentCustomId: 'chief-magno.cruz'}, 
    {facilityId: 12, agentId: 1235, agentCustomId: 'head-felipe.frontoroli'});
```

* Why an array and not just `setAgentCustomId(facilityId, agentId, agentCustomId)`?
  The reason behind that choice is to allow batch modifications, where the caller could, with a single query, update all the custom IDs they wish instead of making multiple calls. It might be useful for the initial migrations and big Facilities' restructuring.

The update might be done using an `UPSERT` operation on the database.

Something like this:

```SQL
UPSERT INTO FacilityAgentCustomIds (facility_id, agent_id, agent_custom_id) VALUES (?, ?, ?); -- Where the (?, ?, ?) would have to be dinamically generated in order to support many tuples at once, based on the length of the array of facilityAgentCustomId received.
```

Time/effort estimate:

Time estimate: It might take up to one working day to make such change, considering only the local development and tests creation.
Effort estimate: 5 in Fibonacci scale.

Acceptance criteria (development): 

- [ ] Having the possibility to upsert a single agent custom id;
- [ ] Having the possibility to upsert multiple agent custom ids;
- [ ] Having an error being thrown if the operation is not succeeded;
- [ ] Having the execution of a single database operation to upsert all of the provided new custom ids;
- [ ] Having the tests created for the new function (It should be done first if using TDD).

### Include Agents' custom ids into the metadata returned by `getShiftsByFacility` (`R` from CRUD)

Currently, the information about the shift is retrieved by a SQL query that returns not only the shift data, but also some info about the agent as metadata.
Our goal is to add a new metadata called `agentCustomId` in the data returned by `getShiftsByFacility`.

Implementation details: 

In order to achieve that, we will need to modify the query that looks for the agent's data, making a right join from the new `FacilityAgentCustomIds` into `Agent` using the facility and agent Id contained in the `Shift` table.

Something like this:

```SQL
SELECT property1, property2, ..., propertyn FROM Shift
LEFT JOIN Agent ON Shift.agent_id = agent.id
LEFT JOIN FacilityAgentCustomIds ON Shift.facility_id = FacilityAgentCustomIds.facility_id AND Shift.agent_id = FacilityAgentCustomIds.agent_id
WHERE Shift.facility_id = ?
    AND Shift.date BETWEEN DATEADD(MONTH, -3, CAST(GETDATE() AS DATE)) AND GETDATE();
```

Any DTO used to handle the metadata must be updated as well to support this new data.

Time/effort estimate: 

Time estimate: It might take up to a half working day to make such change, considering only the local development and tests updates.
Effort estimate: 3 in Fibonacci scale.

Acceptance criteria (development): 

- [ ] The former agent's internal database id present in the metadata should not be removed for fallback purposes;
- [ ] Having the agent's new custom id metadata included on the SQL query for retrieving `Shifts` information;
- [ ] Having the DTOs updated to support this new metadata;
- [ ] Having the method `getShiftsByFacility` updated to return this new metadata in its return object;
- [ ] Having the tests updated in order to recognize this new metadata (It should be done first if using TDD).

### Create function to delete the Agent's custom id by Facility (`D` from CRUD)

Since we are dealing with customized data, we might be able to provide the feature to, not only create and update, but also delete the custom ids.

Implementation details: 

Following the same principle as the update, we need to create a function called `deleteAgentCustomIds(...facilityAgentId)`, being the `facilityAgentId` an object containing the `facilityId` and `agentId` internal database ids.

All of the underlying implementation rules must follow what was done with the upsert.

Time/effort estimate: 

Time estimate: It might take up to one working day to make such change, considering only the local development and tests creation.
Effort estimate: 5 in Fibonacci scale.

The time/effort estimates are the same as the upsert, but one of them can decrease up to a half if the tasks are done sequentially due to their similarities.

Acceptance criteria (development):

- [ ] Having the possibility to delete a single agent custom id;
- [ ] Having the possibility to delete multiple agent custom ids;
- [ ] Having an error being thrown if the operation is not succeeded;
- [ ] Having the execution of a single database operation to delete all of the provided agent ids;
- [ ] Having the tests created for the new function (It should be done first if using TDD).

### Replace Agents' ids with their brand new custom ids into the report generated by `generateReport`

Currently, the agent information used is their internal database id.
Our goal is to use the new shift's metadata property `agentCustomId` and include them in the generated report.

Implementation details: 

Since the new metadata is already returned by `getShiftsByFacility`, it should be present already in the context of `generateReport`.
Needing only a mapping on the structure of the generated PDF page.

Time/effort estimate: 

Time estimate: It might take up to one hour to make such change, considering there is no structural changes to the report.
Effort estimate: 1 in Fibonacci scale.

Acceptance criteria (development):

- [ ] Having the report generated with the brand new agent's custom id, or their original internal database id if the former is not set;
- [ ] Having the tests updated with the new metadate (It should be done first if using TDD).

Acceptance criteria (product): 

- [ ] Having the report generated with the information of the shift's agents' custom ids.
