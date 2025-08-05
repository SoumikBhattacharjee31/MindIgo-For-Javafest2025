package com.mindigo.game_service.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class GameUtils {
    private boolean hasUp(List<Integer> u) {
        return u.get(0) == 4 ||
                (u.get(0) == 3 && u.get(1) != 3) ||
                (u.get(0) == 2 && (u.get(1) == 0 || u.get(1) == 1)) ||
                (u.get(0) == 1 && u.get(1) == 1) ||
                (u.get(0) == 0 && u.get(1) == 0);
    }

    private boolean hasLeft(List<Integer> l) {
        return l.get(0) == 4 ||
                (l.get(0) == 3 && l.get(1) != 2) ||
                (l.get(0) == 2 && (l.get(1) == 0 || l.get(1) == 3)) ||
                (l.get(0) == 1 && l.get(1) == 0) ||
                (l.get(0) == 0 && l.get(1) == 1);
    }

    private List<Integer> genState(List<Integer> u, List<Integer> l) {
        Random rand = new Random();
        boolean hasu = hasUp(u);
        boolean hasl = hasLeft(l);
        List<List<Integer>> c = new ArrayList<>();

        if (hasu && hasl) {
            c.add(List.of(4, 0));
            c.add(List.of(3, 2));
            c.add(List.of(3, 3));
            c.add(List.of(2, 2));
        } else if (hasu) {
            c.add(List.of(3, 0));
            c.add(List.of(2, 3));
            c.add(List.of(1, 3));
            c.add(List.of(0, 0));
        } else if (hasl) {
            c.add(List.of(3, 1));
            c.add(List.of(2, 1));
            c.add(List.of(1, 2));
            c.add(List.of(0, 1));
        } else {
            c.add(List.of(2, 0));
            c.add(List.of(1, 1));
            c.add(List.of(1, 0));
            c.add(List.of(-1, 0));
        }
        return c.get(rand.nextInt(c.size()));
    }

    private List<Integer> genRightState(List<Integer> u, List<Integer> l) {
        Random rand = new Random();
        boolean hasu = hasUp(u);
        boolean hasl = hasLeft(l);
        List<List<Integer>> c = new ArrayList<>();

        if (hasu && hasl) {
            c.add(List.of(3, 2));
            c.add(List.of(2, 2));
        } else if (hasu) {
            c.add(List.of(1, 3));
            c.add(List.of(0, 0));
        } else if (hasl) {
            c.add(List.of(2, 1));
            c.add(List.of(1, 2));
        } else {
            c.add(List.of(1, 1));
            c.add(List.of(-1, 0));
        }
        return c.get(rand.nextInt(c.size()));
    }

    private List<Integer> genBottomState(List<Integer> u, List<Integer> l) {
        Random rand = new Random();
        boolean hasu = hasUp(u);
        boolean hasl = hasLeft(l);
        List<List<Integer>> c = new ArrayList<>();

        if (hasu && hasl) {
            c.add(List.of(3, 3));
            c.add(List.of(2, 2));
        } else if (hasu) {
            c.add(List.of(2, 3));
            c.add(List.of(1, 3));
        } else if (hasl) {
            c.add(List.of(1, 2));
            c.add(List.of(0, 1));
        } else {
            c.add(List.of(1, 0));
            c.add(List.of(-1, 0));
        }
        return c.get(rand.nextInt(c.size()));
    }

    private List<Integer> genBottomRightState(List<Integer> u, List<Integer> l) {
        Random rand = new Random();
        boolean hasu = hasUp(u);
        boolean hasl = hasLeft(l);
        List<List<Integer>> c = new ArrayList<>();

        if (hasu && hasl) {
            c.add(List.of(2, 2));
        } else if (hasu) {
            c.add(List.of(1, 3));
        } else if (hasl) {
            c.add(List.of(1, 2));
        } else {
            c.add(List.of(-1, 0));
        }
        return c.get(rand.nextInt(c.size()));
    }

    public List<List<List<Integer>>> generateGrid(int a, int b) {
        List<List<List<Integer>>> v = new ArrayList<>();

        // Initialize with (-1, -1)
        for (int i = 0; i < a; i++) {
            List<List<Integer>> row = new ArrayList<>();
            for (int j = 0; j < b; j++) {
                row.add(new ArrayList<>(List.of(-1, -1)));
            }
            v.add(row);
        }

        // Main population logic
        for (int i = 0; i < a - 1; i++) {
            for (int j = 0; j < b - 1; j++) {
                List<Integer> u = (i == 0) ? List.of(-1, 0) : v.get(i - 1).get(j);
                List<Integer> l = (j == 0) ? List.of(-1, 0) : v.get(i).get(j - 1);

                List<Integer> state = genState(u, l);
                v.get(i).set(j, state);
            }
        }

        // Right edge
        for (int i = 0; i < a - 1; i++) {
            List<Integer> u = (i == 0) ? List.of(-1, 0) : v.get(i - 1).get(b - 1);
            List<Integer> l = v.get(i).get(b - 2);
            List<Integer> state = genRightState(u, l);
            v.get(i).set(b - 1, state);
        }

        // Bottom edge
        for (int i = 0; i < b - 1; i++) {
            List<Integer> l = (i == 0) ? List.of(-1, 0) : v.get(a - 1).get(i - 1);
            List<Integer> u = v.get(a - 2).get(i);
            List<Integer> state = genBottomState(u, l);
            v.get(a - 1).set(i, state);
        }

        // Bottom-right corner
        List<Integer> l = v.get(a - 1).get(b - 2);
        List<Integer> u = v.get(a - 2).get(b - 1);
        List<Integer> state = genBottomRightState(u, l);
        v.get(a - 1).set(b - 1, state);

        // Final adjustment step
        for (int i = 0; i < a; i++) {
            for (int j = 0; j < b; j++) {
                List<Integer> cell = v.get(i).get(j);
                int x = cell.get(0);
                int y = cell.get(1);

                if (y == 0) {
                    if (x != -1) {
                        y = (x >= 1 && x <= 3) ? 3 : (x == 0 ? 1 : 0);
                    }
                }
                v.get(i).set(j, List.of(x, y));
            }
        }

        return v;
    }

}