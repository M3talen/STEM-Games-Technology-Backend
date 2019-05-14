DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

create table request
(
    id          serial      not null
    constraint request_pk
            primary key,
    team_id     integer     not null,
    "createdAt" timestamp   not null,
    "updatedAt" timestamp   not null,
    body      text          not null,
    route   text            not null
);

alter table request
    owner to "techArenaStem";

create table teams
(
    id          serial      not null
        constraint teams_pk
            primary key,
    name        varchar(64) not null,
    x           integer     not null,
    y           integer     not null,
    points      float     not null,
    "createdAt" timestamp   not null,
    "updatedAt" timestamp   not null,
    username    varchar(64),
    password    varchar(128),
    solved      text,
    statistics   text
);

alter table teams
    owner to "techArenaStem";


create table problems
(
    id                serial      not null
        constraint problems_pk
            primary key,
    name              varchar(64) not null,
    description       text        not null,
    example_test_case text        not null,
    points            integer     not null,
    display_metadata  json        not null,
    unlocked_day      integer     not null,
    "createdAt"       timestamp   not null,
    "updatedAt"       timestamp   not null
);

alter table problems
    owner to "techArenaStem";

create table map_blocks
(
    id               serial    not null
        constraint map_blocks_pk
            primary key,
    x                integer,
    y                integer,
    block_data       json,
    block_type       text,
    display_metadata json,
    problem_id       integer
        constraint map_blocks_fk0
            references problems,
    "createdAt"      timestamp not null,
    "updatedAt"      timestamp not null
);

alter table map_blocks
    owner to "techArenaStem";

create table test_cases
(
    id              serial    not null
        constraint test_cases_pk
            primary key,
    problem_id      integer   not null
        constraint test_cases_fk0
            references problems,
    input           text      not null,
    expected_output text      not null,
    "createdAt"     timestamp not null,
    "updatedAt"     timestamp not null
);

alter table test_cases
    owner to "techArenaStem";

create table submissions
(
    id           serial    not null
        constraint submissions_pk
            primary key,
    test_case_id serial    not null
        constraint submissions_fk0
            references test_cases,
    team_id      serial    not null
        constraint submissions_fk1
            references teams,
    solution     text      not null,
    is_correct   boolean   not null,
    points       float,
    "createdAt"  timestamp not null,
    "updatedAt"  timestamp not null
);

alter table submissions
    owner to "techArenaStem";