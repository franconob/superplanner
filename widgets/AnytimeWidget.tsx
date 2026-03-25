import { Divider, HStack, Image, Rectangle, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  background,
  shapes,
  truncationMode,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, WidgetEnvironment } from 'expo-widgets';

export type AnytimeTask = {
  id: number;
  title: string;
};

export type AnytimeWidgetProps = {
  tasks: AnytimeTask[];
};

function AnytimeWidgetLayout(props: AnytimeWidgetProps, _context: WidgetEnvironment) {
  'widget';

  const tasks = props.tasks ?? [];
  const count = tasks.length;
  const firstTask = tasks[0] ?? null;
  const moreCount = count > 1 ? count - 1 : 0;

  return (
    <ZStack modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
      <Rectangle modifiers={[foregroundStyle('#1C1C1E'), frame({ maxWidth: Infinity, maxHeight: Infinity })]} />
      <VStack
        modifiers={[
          frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }),
          padding({ all: 14 }),
        ]}
      >
        {/* ── Top row: icon + count badge ── */}
        <HStack modifiers={[frame({ maxWidth: Infinity })]}>
          {/* Icon circle */}
          <Image
            systemName="square.3.layers.3d"
            size={16}
            color="#8E8E93"
            modifiers={[
              background('#2C2C2E', shapes.circle()),
              padding({ all: 7 }),
            ]}
          />
          <Spacer />
          {/* Count badge */}
          <Text
            modifiers={[
              font({ size: 13, weight: 'medium' }),
              foregroundStyle('#8E8E93'),
              background('#2C2C2E', shapes.capsule()),
              padding({ horizontal: 8, vertical: 3 }),
            ]}
          >
            {String(count)}
          </Text>
        </HStack>

        {/* ── Title ── */}
        <Text
          modifiers={[
            font({ size: 15, weight: 'bold' }),
            foregroundStyle('#3B82F6'),
            padding({ top: 8, bottom: 2 }),
          ]}
        >
          Anytime Tasks
        </Text>

        <Divider />

        {/* ── First task ── */}
        <Text
          modifiers={[
            font({ size: 14 }),
            foregroundStyle(firstTask ? '#FFFFFF' : '#8E8E93'),
            padding({ top: 6 }),
            lineLimit(1),
            truncationMode('tail'),
          ]}
        >
          {firstTask ? firstTask.title : 'No tasks yet'}
        </Text>

        {/* ── +N more ── */}
        {moreCount > 0 && (
          <Text
            modifiers={[
              font({ size: 13 }),
              foregroundStyle('#8E8E93'),
              padding({ top: 3 }),
            ]}
          >
            {`+${moreCount} more`}
          </Text>
        )}

        <Spacer />

        {/* ── Branding ── */}
        <Text
          modifiers={[
            font({ size: 11 }),
            foregroundStyle('#8E8E93'),
            frame({ maxWidth: Infinity, alignment: 'trailing' }),
          ]}
        >
          SuperPlanner
        </Text>
      </VStack>
    </ZStack>
  );
}

export default createWidget('AnytimeWidget', AnytimeWidgetLayout);
