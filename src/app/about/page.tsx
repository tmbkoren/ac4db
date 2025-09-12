import { Center, Stack, Title, Text, Anchor } from "@mantine/core";

export default function AboutPage() {
  return (
    <Center>
      <Stack
        align='center'
        gap='md'
      >
        <Title order={1}>About AC4DB</Title>
        <br />
        <Title order={3}>Why does this exist?</Title>
        <Text>
          AC4DB is something I wish existed when I was starting out in ACFA.
        </Text>
        <Text>
          A structured way to find examples of builds using specific parts or
          weapons or inspiration for paintjobs.
        </Text>
        <Text>So there it is.</Text>
        <Title order={3}>Have a suggestion or found a bug?</Title>
        <Text>
          Contact me on{' '}
          <Anchor href='https://discord.gg/armoredcore'>
            Armored Core discord
          </Anchor>
          , in 4th gen channel, @tmbkoren.
        </Text>
        <br />
        <Title order={4}>
          Special thanks to{' '}
          <Anchor href='https://github.com/WarpZephyr/'>Natsu</Anchor> for figuring out savedata structure and offsets.
        </Title>
      </Stack>
    </Center>
  );
}